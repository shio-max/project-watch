import { getFirestore } from "firebase/firestore";
import { app } from "@/lib/firebase/firebase";

const db = getFirestore(app);
export default db;
