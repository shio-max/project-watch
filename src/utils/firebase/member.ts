import { MemberInfo } from "@/types/member";
import db from "./firestore";
import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const membersCollection = collection(db, "member");

// クエリなしのメンバ一覧取得
export const fetchAllMembers = async () => {
  const querySnapshot = await getDocs(membersCollection);

  const members: MemberInfo[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MemberInfo[];

  return members;
};

// クエリありのメンバ一覧取得
export const fetchMembers = async (isDeletedMembers: boolean) => {
  // Firestore クエリを作成
  const membersQuery = query(
    membersCollection,
    where("isDeleted", "==", isDeletedMembers)
  );

  const querySnapshot = await getDocs(membersQuery);

  const members: MemberInfo[] = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MemberInfo[];

  return members;
};

// メンバ追加
export const addMember = async (data: MemberInfo) => {
  await addDoc(membersCollection, data);
};

// メンバ編集
export const updateMember = async (data: MemberInfo) => {
  const memberDocRef = doc(db, "member", data.id!);
  await updateDoc(memberDocRef, data);
};

// メンバ削除(論理削除)
export const deleteMember = async (memberId: string) => {
  const memberDocRef = doc(db, "member", memberId);

  // 現在の日付を YYYY/MM/DD hh:mm 形式で取得
  const now = new Date();
  const formattedDate = `${now.getFullYear()}/${String(
    now.getMonth() + 1
  ).padStart(2, "0")}/${String(now.getDate()).padStart(2, "0")} ${String(
    now.getHours()
  ).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  await updateDoc(memberDocRef, {
    isDeleted: true,
    deletedAt: formattedDate,
  });
};
