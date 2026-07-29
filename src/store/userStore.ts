import { reactive } from 'vue'
import { supabase } from '../api/supabase'
import { supabaseHelpers } from '@/utils/supabaseHelpers'
import { saveAuthState, clearAuthState } from '../utils/authPersistence'
import type { Session, User } from '@supabase/supabase-js';
import { dataSources, initDataObjects } from '@/api/dataObjects';

interface UserProfile {
  id?: number
  email: string
  username: string
  auth_id: string;
  profile_picture_url: string;
  [key: string]: any
}

interface UserState {
  user: User | null
  session: Session | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null;
  isLoaded: boolean;
}

let resolveReady!: () => void;

const readyPromise = new Promise<void>((resolve) => {
    resolveReady = resolve;
});

const state = reactive<UserState>({
  user: null,
  session: null,
  userProfile: null,
  loading: false,
  error: null,
  isLoaded: false
});

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

export const userStore = {
  // --- Getters ---
  get user() {
    return state.user
  },
  get session() {
    return state.session
  },
  get userProfile() {
    return state.userProfile
  },
  get loading() {
    return state.loading
  },
  get error() {
    return state.error
  },
  get isAuthenticated() {
    return !!state.user
  },
  get isLoaded() {
    return state.isLoaded;
  },

  // --- Methods ---
  async init() {
    try {
      state.isLoaded = false;
      const { data } = await supabase.auth.getSession()
      state.session = data.session
      state.user = data.session?.user || null

      // Auth state listener
      supabase.auth.onAuthStateChange(
        async (_event, session) => {
          console.log('Auth state changed:', _event)

          state.session = session
          state.user = session?.user || null

          if (session) saveAuthState(session)
          else clearAuthState()

          if (state.user) await this.fetchUserProfile()
          else state.userProfile = null
        }
      )

      if (state.user) await this.fetchUserProfile()

      if (state.userProfile && state.userProfile.id && !dataSources.manager) {
        await initDataObjects(supabase, state.userProfile.id);
      }

      return { success: true }
    } catch (error: any) {
      console.error('Error initializing auth:', error)
      return { success: false, error }
    } finally {
      state.isLoaded = true;
      resolveReady();
    }
  },

  ready() {
    return readyPromise;
  },

  updateAuthState(session: Session | null) {
    state.session = session
    state.user = session?.user || null
    if (session) saveAuthState(session)
    else clearAuthState()
  },

  async fetchUserProfile() {
    if (!state.user) return null

    try {
      if (state.userProfile && state.userProfile.auth_id === state.user.id) {
        return state.userProfile
      }

      state.loading = true
      const { data, error } = await this.getByAuthId(
        state.user.id
      )

      if (error) throw error
      state.userProfile = data
      return data
    } catch (error: any) {
      console.error('Error fetching user profile:', error)
      if (!state.userProfile && state.user) {
        state.userProfile = {
          email: state.user.email ?? '',
          username: state.user.email?.split('@')[0] ?? 'unknown',
          auth_id: state.user.id
        }
      }
      return state.userProfile
    } finally {
      state.loading = false
    }
  },

  async signUp(email: string, password: string, username: string, isPrivate: boolean) {
    try {
      state.loading = true
      state.error = null

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) throw error

      if (data.user) {
        const { error: profileError } = await supabaseHelpers.create('users', {
          auth_id: data.user.id,
          email,
          username,
          password_hash: 'managed_by_supabase',
          is_private: isPrivate
        })
        if (profileError) throw profileError
      }

      return { data, error: null }
    } catch (error: any) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async signIn(email: string, password: string) {
    try {
      state.loading = true
      state.error = null

      if (!email) {
        state.error = 'Please enter your email address'
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      if (data.user) await this.fetchUserProfile()

      return { data, error: null }
    } catch (error: any) {
      state.error = error.message
      return { data: null, error }
    } finally {
      state.loading = false
    }
  },

  async signOut() {
    try {
      state.loading = true
      state.error = null

      const { error } = await supabase.auth.signOut()
      if (error) throw error

      state.user = null
      state.session = null
      state.userProfile = null
      clearAuthState()

      return { error: null }
    } catch (error: any) {
      state.error = error.message
      return { error }
    } finally {
      state.loading = false
    }
  },

  async resetPassword(email: string) {
    try {
      state.loading = true
      state.error = null

      if (!email) {
        state.error = 'Please enter your email address'
        return
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://footiepredictors.com/reset-password'
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      state.error = error.message
      return { error }
    } finally {
      state.loading = false
    }
  },

  async updatePassword(newPassword: string) {
    try {
      state.loading = true
      state.error = null

      if (!newPassword) {
        state.error = 'Please enter password'
        return
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) throw error

      return { error: null }
    } catch (error: any) {
      state.error = error.message
      return { error }
    } finally {
      state.loading = false
    }
  },

  async getUser(userId: string) {
    try {
      const { data, error } = await supabaseHelpers.customQuery<UserProfile>(
        (supabase) => supabase.from('users').select('*').eq('id', userId).single()
      )

      if (error) throw error
      return { data, error: null }
    } catch (error: any) {
      console.error('Error fetching user:', error)
      return { data: null, error }
    }
  },

  async getByAuthId(authId: string) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single()
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  },

  clearError() {
    state.error = null
  },

  /**
   * Upload a display image
   * @param {File} file - File to use as profile picture
   * @returns {Promise<{url: string|null, error: any|null}>}
   */
  async uploadDisplayPicture(file: File) {
    if (!file) return { error: 'Missing file' };

    const userId = userStore.user?.id;
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`; // folder = user id

    const { error: uploadError } = await supabase.storage
      .from('profile-pictures')
      .upload(filePath, file, { upsert: true });

    if (uploadError) {
      console.error('Upload error:', uploadError.message);
      return { error: uploadError };
    }

    // Get a public URL (works only if the bucket allows public read)
    const { data: publicUrlData } = supabase.storage
      .from('profile-pictures')
      .getPublicUrl(filePath);

    await dataSources.user?.update(dataSources.user?.currentRecord?.id, {
      profile_picture_url: publicUrlData.publicUrl
    });

    userStore.userProfile.profile_picture_url = publicUrlData.publicUrl;

    return { url: publicUrlData.publicUrl, error: null };
  },

  /**
   * Remove the user's profile picture
   * Deletes the image from storage and clears the DB field
   * @returns {Promise<{ success: boolean, error: any | null }>}
   */
  async removeDisplayPicture() {
    const userId = userStore.user?.id;
    const profileUrl = userStore.userProfile?.profile_picture_url;

    if (!profileUrl) {
      return { success: false, error: 'No profile picture to remove' };
    }

    try {
      // Extract file extension from the URL (we know the pattern)
      const fileExt = profileUrl.split('.').pop().split('?')[0]; // handles ?token=... case
      const filePath = `${userId}/avatar.${fileExt}`;

      const { error: deleteError } = await supabase.storage
        .from('profile-pictures')
        .remove([filePath]);

      if (deleteError) {
        console.error('Delete error:', deleteError.message);
        return { success: false, error: deleteError };
      }

      // Clear DB field
      await dataSources.user?.update(dataSources.user?.currentRecord?.id, {
        profile_picture_url: null
      });
      userStore.userProfile.profile_picture_url = null;

      return { success: true, error: null };
    } catch (err) {
      console.error('Unexpected error during removal:', err);
      return { success: false, error: err };
    }
  }

}