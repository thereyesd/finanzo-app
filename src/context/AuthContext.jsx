import { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, googleProvider, db } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout — if Firebase doesn't respond in 4s, stop waiting
        const timeoutId = setTimeout(() => {
            if (mounted) {
                console.warn('Firebase auth initialization timed out');
                setLoading(false);
            }
        }, 4000);

        // Check if auth instance exists (Firebase initialized)
        if (!auth) {
            console.error("Auth instance not found (Firebase init failed)");
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            clearTimeout(timeoutId);

            if (!mounted) return;

            if (firebaseUser) {
                try {
                    setUser(firebaseUser);
                    // Fetch user profile from Firestore
                    if (db) {
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        const userDoc = await getDoc(userDocRef);

                        if (mounted && userDoc.exists()) {
                            setUserProfile(userDoc.data());
                        }
                    }
                } catch (error) {
                    console.error("Error fetching profile:", error);
                }
            } else {
                setUser(null);
                setUserProfile(null);
            }
            if (mounted) setLoading(false);
        }, (error) => {
            console.error("Firebase Auth Error:", error);
            clearTimeout(timeoutId);
            if (mounted) setLoading(false);
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            if (unsubscribe) unsubscribe();
        };
    }, []);

    const login = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    const register = async (email, password, name) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        // Create user profile in Firestore
        await setDoc(doc(db, 'users', result.user.uid), {
            uid: result.user.uid,
            email: result.user.email,
            name: name,
            plan: 'free',
            currency: 'PYG',
            country: 'PY',
            onboardingCompleted: false,
            createdAt: new Date().toISOString()
        });
        return result.user;
    };

    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;

        // Check if user profile exists, if not create one
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);

        let profileData;

        if (!userDoc.exists()) {
            profileData = {
                uid: user.uid,
                email: user.email,
                name: user.displayName || '',
                photoURL: user.photoURL || '',
                plan: 'free',
                currency: 'PYG',
                country: 'PY',
                onboardingCompleted: false,
                createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, profileData);
        } else {
            profileData = userDoc.data();
        }

        setUser(user);
        setUserProfile(profileData);
        return { user, profile: profileData };
    };

    const logout = async () => {
        await signOut(auth);
    };

    const updateUserProfile = async (data) => {
        if (user) {
            await setDoc(doc(db, 'users', user.uid), data, { merge: true });
            setUserProfile(prev => ({ ...prev, ...data }));
        }
    };

    const value = {
        user,
        userProfile,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        updateUserProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
