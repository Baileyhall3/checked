<template>
    <ion-page>
        <ion-content>
            <div class="flex justify-center px-4">
                <div class="max-w-md w-full">
                    <div>
                        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Create a new account
                        </h2>
                        <p class="mt-2 text-center text-sm text-gray-600">
                            Or
                            <router-link to="/login" class="font-medium text-blue-600 hover:text-blue-500">
                                sign in to your existing account
                            </router-link>
                        </p>
                    </div>
                    <form class="mt-8 space-y-6" @submit.prevent="handleRegister" novalidate>
                        <div class="*:not-first:mt-2">
                            <Label for="username">
                                Username
                            </Label>
                            <Input 
                                id="username" 
                                placeholder="Username" 
                                type="text" 
                                required 
                                v-model="signUpData.username" 
                                :class="errors.username ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'"
                            />
                            <p
                                class="text-destructive mt-2 text-xs"
                                role="alert"
                                aria-live="polite"
                                >
                                {{ errors.username }}
                            </p>
                        </div>
                        <div class="*:not-first:mt-2">
                            <Label for="email">
                                Email
                            </Label>
                            <Input 
                                id="email" 
                                placeholder="Email" 
                                type="email" 
                                required 
                                v-model="signUpData.email" 
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
                        <div class="items-top flex gap-x-2 *:not-first:mt-2">
                            <Checkbox id="isPrivate" v-model="signUpData.isPrivate" />
                            <div class="grid gap-1.5 leading-none">
                                <label
                                    for="isPrivate"
                                    class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                    Private account
                                </label>
                                <p class="text-sm text-muted-foreground">
                                    Check this to make your account private, meaning you will not show up in public searches.
                                </p>
                            </div>
                        </div>
                        <div>
                            <div class="*:not-first:mt-2">
                                <Label for="password-input" class="font-medium">Password</Label>
                                <InputGroup
                                    :class="errors.repeatPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'"
                                >
                                    <InputGroupInput
                                        id="password-input"
                                        placeholder="Password"
                                        :type="isVisible ? 'text' : 'password'"
                                        v-model="signUpData.password"
                                        aria-describedby="password-description"
                                        :class="errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'"
                                    />
                                    <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        size="icon-xs"
                                        type="button"
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
                            </div>
                            
                            <div>
                                <!-- Password strength indicator -->
                                <div
                                    class="bg-border mt-3 mb-4 h-1 w-full overflow-hidden rounded-full"
                                    role="progressbar"
                                    :aria-valuenow="strengthScore"
                                    aria-valuemin="0"
                                    aria-valuemax="5"
                                    aria-label="Password strength"
                                >
                                    <div
                                        :class="`h-full ${getStrengthColor(strengthScore)} transition-all duration-500 ease-out`"
                                        :style="{ width: `${(strengthScore / 5) * 100}%` }"
                                    ></div>
                                </div>
                
                                <!-- Password strength description -->
                                <p
                                    id="password-description"
                                    class="text-foreground mb-2 text-sm font-medium"
                                >
                                    {{ getStrengthText(strengthScore) }}. Must contain:
                                </p>
                
                                <!-- Password requirements list -->
                                <ul class="space-y-1.5" aria-label="Password requirements">
                                    <li
                                        v-for="(req, index) in strength"
                                        :key="index"
                                        class="flex items-center gap-2"
                                    >
                                        <LucideCheck
                                            v-if="req.met"
                                            :size="16"
                                            class="text-emerald-500"
                                            aria-hidden="true"
                                        />
                                        <LucideX
                                            v-else
                                            :size="16"
                                            class="text-muted-foreground/80"
                                            aria-hidden="true"
                                        />
                                        <span
                                            :class="`text-xs ${req.met ? 'text-emerald-600' : 'text-muted-foreground'}`"
                                        >
                                            {{ req.text }}
                                            <span class="sr-only">
                                                {{ req.met ? " - Requirement met" : " - Requirement not met" }}
                                            </span>
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
    
                        <div class="*:not-first:mt-2">
                            <Label for="repeat-password-input" class="font-medium">Repeat password</Label>
                            <InputGroup 
                                :class="errors.repeatPassword ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-blue-500'"
                            >
                                <InputGroupInput
                                    id="repeat-password-input"
                                    placeholder="Repeat password"
                                    :type="isVisible ? 'text' : 'password'"
                                    v-model="signUpData.repeatPassword"
                                    aria-describedby="password-description"
                                />
                                <InputGroupAddon align="inline-end">
                                    <InputGroupButton
                                        size="icon-xs"
                                        type="button"
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
                                {{ errors.repeatPassword }}
                            </p>
                        </div>

                        <div>
                            <Button class="w-full" :disabled="isSubmitting">
                                <Spinner v-if="isSubmitting" />
                                Sign Up
                            </Button>
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
import { LucideCheck, LucideEye, LucideEyeOff, LucideX } from "lucide-vue-next";
import { computed, ref, reactive } from "vue";
import Button from '@/components/ui/button/Button.vue';
import { userStore } from "@/store/userStore";
import { useRouter } from "vue-router";
import { useToast } from "@/components/ui/toast/use-toast";
import { Spinner } from "@/components/ui/spinner";
import { Checkbox } from "@/components/ui/checkbox";

const isVisible = ref(false);
const isSubmitting = ref(false);
const router = useRouter();

const signUpData = reactive({
    username: '',
    email: '',
    password: '',
    repeatPassword: '',
    isPrivate: false
});

const errors = reactive({
    username: '',
    email: '',
    password: '',
    repeatPassword: ''
});

function toggleVisibility() {
  isVisible.value = !isVisible.value;
}

function checkStrength(pass: string) {
  const requirements = [
    { regex: /.{8,}/, text: "At least 8 characters" },
    { regex: /[0-9]/, text: "At least 1 number" },
    { regex: /[a-z]/, text: "At least 1 lowercase letter" },
    { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
    { regex: /[!@#$%^&*(),.?":{}|<>]/, text: "At least 1 special character" },
  ];

  return requirements.map((req) => ({
    met: req.regex.test(pass),
    text: req.text,
  }));
}

const strength = computed(() => checkStrength(signUpData.password));

const strengthScore = computed(() => {
  return strength.value.filter((req) => req.met).length;
});

function getStrengthColor(score: number) {
  if (score === 0) return "bg-border";
  if (score <= 1) return "bg-red-500";
  if (score <= 3) return "bg-orange-500";
  if (score <= 4) return "bg-amber-500";
  return "bg-emerald-500";
}

function getStrengthText(score: number) {
  if (score === 0) return "Enter a password";
  if (score <= 2) return "Weak password";
  if (score <= 4) return "Medium password";
  return "Strong password";
}

function validate() {
    // Clear previous errors
    Object.keys(errors).forEach(key => (errors[key] = ''));

    if (!signUpData.username) errors.username = 'Username is required';
    if (!signUpData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(signUpData.email)) errors.email = 'Invalid email';

    const strengthScoreValue = strengthScore.value;
    if (!signUpData.password) errors.password = 'Password is required';
    else if (strengthScoreValue < 5) errors.password = 'Password does not meet all requirements';

    if (!signUpData.repeatPassword) errors.repeatPassword = 'Password is required';
    if (signUpData.password !== signUpData.repeatPassword) errors.repeatPassword = 'Passwords do not match';

    return Object.values(errors).every(e => !e); // true if no errors
}

async function handleRegister() {
    const { toast } = useToast();

    try {
        isSubmitting.value = true;

        if (!validate()) {
            toast({
                title: 'Registration unsuccessful.',
                description: 'One or more fields are invalid.',
                variant: "destructive"
            });
            return; 
        }
    
        const { data, error } = await userStore.signUp(signUpData.email, signUpData.password, signUpData.username, signUpData.isPrivate);
      
        if (!error) {        
            signUpData.email = '';
            signUpData.username = '';
            signUpData.password = '';
            signUpData.repeatPassword = '';
            signUpData.isPrivate = false;
            
            toast({
                title: 'Registration successful!',
                description: 'Please check your emails to complete.'
            });
    
            // Redirect to login after a delay
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } else {
            toast({
                title: 'Registration unsuccessful. An error occurred.',
                description: `Error: ${error.message}`,
                variant: "destructive"
            });
        }
    } catch (err) {
        console.error(err);
        toast({
                title: 'Registration unsuccessful. An error occurred.',
                description: `Error: ${err}`,
                variant: "destructive"
            });
    } finally {
        isSubmitting.value = false;
    }

}
</script>