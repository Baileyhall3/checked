<template>
    <ion-page>
        <ion-content>
            <div class="flex justify-center px-4">
                <div class="max-w-md w-full">
                    <div>
                        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Sign in to your account
                        </h2>
                        <p class="mt-2 text-center text-sm text-gray-600">
                            Or
                            <router-link to="/register" class="font-medium text-blue-600 hover:text-blue-500">
                                create a new account
                            </router-link>
                        </p>
                    </div>
                    <form class="mt-8 space-y-6" @submit.prevent="handleLogin" novalidate>
                        <div class="*:not-first:mt-2">
                            <Label for="email">
                                Email
                            </Label>
                            <Input 
                                id="email" 
                                placeholder="Email" 
                                type="email" 
                                required 
                                v-model="loginData.email" 
                                :class="errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'"
                            />
                            <p
                                class="text-destructive mt-2 text-xs"
                                role="alert"
                                aria-live="polite"
                                >
                                {{ errors.email }}
                            </p>
                        </div>
                        <div>
                            <div class="*:not-first:mt-2">
                                <Label for="password-input" class="font-medium">Password</Label>
                                <InputGroup
                                    :class="errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'"
                                >
                                    <InputGroupInput
                                        id="password-input"
                                        placeholder="Password"
                                        :type="isVisible ? 'text' : 'password'"
                                        v-model="loginData.password"
                                        aria-describedby="password-description"
                                    />
                                    <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        type="button"
                                        size="icon-xs"
                                        @click="toggleVisibility"
                                        :aria-label="isVisible ? 'Hide password' : 'Show password'"
                                        :aria-pressed="isVisible"
                                        aria-controls="password"
                                    >
                                        <LucideEyeOff v-if="isVisible" :size="16" aria-hidden="true" />
                                        <LucideEye v-else :size="16" aria-hidden="true" />
                                    </InputGroupButton>
                                    </InputGroupAddon>
                                </InputGroup>
                                <p
                                    class="text-destructive mt-2 text-xs"
                                    role="alert"
                                    aria-live="polite"
                                    >
                                    {{ errors.password }}
                                </p>
                            </div>
                        </div>
                        <div>
                            <Button class="w-full" :disabled="isSubmitting">
                                <Spinner v-if="isSubmitting" />
                                Sign In
                            </Button>
                            <!-- <div class="mt-1">
                                <div class="text-sm">
                                    <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500" @click.prevent="forgotPassword">
                                        Forgot your password?
                                    </a>
                                </div>
                            </div> -->
                        </div>
                    </form>
                </div>
            </div>
        </ion-content>
    </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonPage } from '@ionic/vue';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LucideEye, LucideEyeOff } from "lucide-vue-next";
import { ref, reactive } from "vue";
import Button from '@/components/ui/button/Button.vue';
import { useRouter } from "vue-router";
import { useToast } from "@/components/ui/toast/use-toast";
import { userStore } from "@/store/userStore";
import { Spinner } from "@/components/ui/spinner";

const isVisible = ref(false);
const isSubmitting = ref(false);
const router = useRouter();

const loginData = reactive({
    email: '',
    password: ''
});

const errors = reactive({
    email: '',
    password: ''
});

function toggleVisibility() {
  isVisible.value = !isVisible.value;
}

function validate() {
    Object.keys(errors).forEach(key => (errors[key] = ''));

    if (!loginData.email) errors.email = 'Email is required';
    if (!loginData.password) errors.password = 'Password is required';

    return Object.values(errors).every(e => !e); // true if no errors
}

async function handleLogin() {
    const { toast } = useToast();

    try {
        isSubmitting.value = true;

        if (!validate()) {
            toast({
                title: 'Login unsuccessful.',
                description: 'One or more fields are invalid.',
                variant: "destructive"
            });
            return; 
        }
    
        const { error } = await userStore.signIn(loginData.email, loginData.password);
        if (!error) {
            loginData.email = '';
            loginData.password = '';
            errors.email = '';
            errors.password = '';
            router.push('/');
        } else {
            toast({
                title: 'Login unsuccessful. An error occurred.',
                description: `Error: ${error.message}`,
                variant: "destructive"
            });
        }
    } catch (err) {
        console.error(err);
        toast({
            title: 'Login unsuccessful. An error occurred.',
            description: `Error: ${err}`,
            variant: "destructive"
        });
    } finally {
        isSubmitting.value = false;
    }

}
</script>