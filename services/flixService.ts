
import { Movie } from "../types";
import { moviesData } from "../moviesData";
import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  setDoc, 
  doc, 
  deleteDoc, 
  updateDoc, 
  writeBatch, 
  query, 
  orderBy, 
  limit, 
  startAfter,
  QueryDocumentSnapshot,
  DocumentData
} from 'firebase/firestore';
import { telegramService } from "./telegramService";

// --- FIREBASE CONFIGURATION ---
const firebaseConfig = {
  apiKey: 'AIzaSyB4X_aP0f0-EcvOfgIZsSoqdiguREVMGUM',
  authDomain: 'planning-with-ai-flex.firebaseapp.com',
  projectId: 'planning-with-ai-flex',
  storageBucket: 'planning-with-ai-flex.firebasestorage.app',
  messagingSenderId: '733103696617',
  appId: '1:733103696617:web:761d22e230a63697455e78'
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
const COLLECTION_NAME = "flix";

export const flixService = {
  async uploadMovies(): Promise<void> {
    const batch = writeBatch(db);
    (moviesData as Movie[]).forEach((movie) => {
        if (movie.id) {
            const docRef = doc(db, COLLECTION_NAME, movie.id);
            batch.set(docRef, movie);
        }
    });
    try {
        await batch.commit();
    } catch (error) {
        console.error("Error uploading movies:", error);
    }
  },

  // Get first batch of movies
  async getInitialMovies(limitCount: number = 6): Promise<{ movies: Movie[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("id", "desc"), 
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { movies: [], lastDoc: null };
      }

      const movies: Movie[] = [];
      querySnapshot.forEach((doc) => {
        movies.push(doc.data() as Movie);
      });

      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { movies, lastDoc };
    } catch (error) {
      console.error("Error getting initial movies:", error);
      return { movies: [], lastDoc: null };
    }
  },

  // Get next batch of movies
  async getMoreMovies(lastDoc: QueryDocumentSnapshot<DocumentData>, limitCount: number = 3): Promise<{ movies: Movie[], lastDoc: QueryDocumentSnapshot<DocumentData> | null }> {
    try {
      const q = query(
        collection(db, COLLECTION_NAME), 
        orderBy("id", "desc"), 
        startAfter(lastDoc),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        return { movies: [], lastDoc: null };
      }

      const movies: Movie[] = [];
      querySnapshot.forEach((doc) => {
        movies.push(doc.data() as Movie);
      });

      const nextLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      return { movies, lastDoc: nextLastDoc };
    } catch (error) {
      console.error("Error getting more movies:", error);
      return { movies: [], lastDoc: null };
    }
  },

  // Fetch all for search purposes (cached locally)
  async getAllMovies(): Promise<Movie[]> {
    try {
      const q = query(collection(db, COLLECTION_NAME), orderBy("id", "desc"));
      const querySnapshot = await getDocs(q);
      const movies: Movie[] = [];
      querySnapshot.forEach((doc) => {
        movies.push(doc.data() as Movie);
      });
      return movies;
    } catch (error) {
      return moviesData as Movie[];
    }
  },

  async addMovie(movie: Movie): Promise<void> {
    // Corrected: Removed the automatic Telegram post.
    // Movies are now added ONLY to the database.
    // Admins can use the "Send" button in the panel to manually post to Telegram after verification.
    await setDoc(doc(db, COLLECTION_NAME, movie.id), movie);
  },

  async updateMovie(movie: Movie): Promise<void> {
    const movieRef = doc(db, COLLECTION_NAME, movie.id);
    await updateDoc(movieRef, { ...movie });
  },

  async deleteMovie(id: string): Promise<void> {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  }
};
