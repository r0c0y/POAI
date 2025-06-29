import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  GithubAuthProvider,
  signOut,
  onAuthStateChanged,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

// Providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// Add scopes for additional user information
googleProvider.addScope('profile');
googleProvider.addScope('email');
githubProvider.addScope('user:email');

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'patient' | 'provider' | 'admin' | 'guest';
  createdAt: Date;
  lastLogin: Date;
  preferences: {
    language: 'en-US' | 'hi-IN';
    voiceEnabled: boolean;
    notifications: boolean;
  };
  medicalInfo?: {
    patientId?: string;
    surgeryType?: string;
    surgeryDate?: Date;
    assignedProvider?: string;
  };
  isGuest?: boolean;
}

class AuthService {
  private currentUser: User | null = null;
  private userProfile: UserProfile | null = null;

  constructor() {
    // Check for guest user on initialization
    this.checkGuestUser();
    
    // Listen for auth state changes
    onAuthStateChanged(auth, async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadUserProfile(user.uid);
      } else if (!this.userProfile?.isGuest) {
        this.userProfile = null;
      }
    });
  }

  private checkGuestUser() {
    const guestUser = localStorage.getItem('guestUser');
    if (guestUser) {
      try {
        const guestData = JSON.parse(guestUser);
        this.userProfile = {
          ...guestData,
          createdAt: new Date(guestData.createdAt),
          lastLogin: new Date(guestData.lastLogin),
          preferences: {
            language: 'en-US',
            voiceEnabled: true,
            notifications: false
          },
          isGuest: true
        };
      } catch (error) {
        console.error('Error parsing guest user data:', error);
        localStorage.removeItem('guestUser');
      }
    }
  }

  // Google Sign In
  async signInWithGoogle(): Promise<UserProfile> {
    try {
      // Clear guest session if exists
      localStorage.removeItem('guestUser');
      
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Create or update user profile
      const userProfile = await this.createOrUpdateUserProfile(user);
      return userProfile;
    } catch (error) {
      console.error('Google sign in error:', error);
      throw new Error('Failed to sign in with Google');
    }
  }

  // GitHub Sign In
  async signInWithGithub(): Promise<UserProfile> {
    try {
      // Clear guest session if exists
      localStorage.removeItem('guestUser');
      
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      
      // Create or update user profile
      const userProfile = await this.createOrUpdateUserProfile(user);
      return userProfile;
    } catch (error) {
      console.error('GitHub sign in error:', error);
      throw new Error('Failed to sign in with GitHub');
    }
  }

  // Guest Sign In
  async signInAsGuest(): Promise<UserProfile> {
    try {
      const now = new Date();
      const guestProfile: UserProfile = {
        uid: `guest-${Date.now()}`,
        email: 'guest@sehat-ai.com',
        displayName: 'Guest User',
        role: 'guest',
        createdAt: now,
        lastLogin: now,
        preferences: {
          language: 'en-US',
          voiceEnabled: true,
          notifications: false
        },
        isGuest: true
      };
      
      this.userProfile = guestProfile;
      
      // Update localStorage
      localStorage.setItem('guestUser', JSON.stringify({
        ...guestProfile,
        createdAt: now.toISOString(),
        lastLogin: now.toISOString()
      }));
      
      return guestProfile;
    } catch (error) {
      console.error('Guest sign in error:', error);
      throw new Error('Failed to sign in as guest');
    }
  }

  // Create or update user profile in Firestore
  private async createOrUpdateUserProfile(user: User): Promise<UserProfile> {
    const userRef = doc(db, 'users', user.uid);
    const userSnap = await getDoc(userRef);
    
    const now = new Date();
    
    if (userSnap.exists()) {
      // Update existing user
      const existingData = userSnap.data() as UserProfile;
      const updatedProfile: UserProfile = {
        ...existingData,
        lastLogin: now,
        displayName: user.displayName || existingData.displayName,
        photoURL: user.photoURL || existingData.photoURL,
        isGuest: false
      };
      
      await setDoc(userRef, updatedProfile, { merge: true });
      this.userProfile = updatedProfile;
      return updatedProfile;
    } else {
      // Create new user profile
      const newProfile: UserProfile = {
        uid: user.uid,
        email: user.email || '',
        displayName: user.displayName || 'User',
        photoURL: user.photoURL || undefined,
        role: 'patient', // Default role
        createdAt: now,
        lastLogin: now,
        preferences: {
          language: 'en-US',
          voiceEnabled: true,
          notifications: true
        },
        isGuest: false
      };
      
      await setDoc(userRef, newProfile);
      this.userProfile = newProfile;
      return newProfile;
    }
  }

  // Load user profile from Firestore
  private async loadUserProfile(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        this.userProfile = { ...userSnap.data(), isGuest: false } as UserProfile;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  // Update user profile
  async updateUserProfile(updates: Partial<UserProfile>): Promise<void> {
    if (!this.currentUser && this.userProfile?.role !== 'guest') {
      throw new Error('No authenticated user');
    }

    try {
      if (this.userProfile?.role !== 'guest' && this.currentUser) {
        const userRef = doc(db, 'users', this.currentUser.uid);
        await setDoc(userRef, updates, { merge: true });
      }
      
      // Update local profile
      if (this.userProfile) {
        this.userProfile = { ...this.userProfile, ...updates };
        
        // Update localStorage for guest users
        if (this.userProfile.isGuest) {
          localStorage.setItem('guestUser', JSON.stringify({
            ...this.userProfile,
            createdAt: this.userProfile.createdAt.toISOString(),
            lastLogin: this.userProfile.lastLogin.toISOString()
          }));
        }
      }
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw new Error('Failed to update profile');
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    try {
      if (this.userProfile?.isGuest) {
        // Clear guest session
        localStorage.removeItem('guestUser');
      } else {
        // Sign out from Firebase
        await signOut(auth);
      }
      
      this.currentUser = null;
      this.userProfile = null;
    } catch (error) {
      console.error('Sign out error:', error);
      throw new Error('Failed to sign out');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    return this.currentUser;
  }

  // Get user profile
  getUserProfile(): UserProfile | null {
    return this.userProfile;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null || this.userProfile?.isGuest === true;
  }

  // Check user role
  hasRole(role: string): boolean {
    return this.userProfile?.role === role;
  }

  // Wait for auth to initialize
  waitForAuth(): Promise<User | null> {
    return new Promise((resolve) => {
      // If guest user, resolve immediately
      if (this.userProfile?.isGuest) {
        resolve(null);
        return;
      }
      
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;