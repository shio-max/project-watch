import { ProjectContainer } from "@/types/project";
import db from "./firestore";
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

// プロジェクト一覧取得
export const fetchProjects = async (): Promise<ProjectContainer[]> => {
  const querySnapshot = await getDocs(collection(db, "project"));
  const projectsData = querySnapshot.docs.map((doc) => ({
    id: doc.id, // ドキュメントIDを利用
    displayOrder: doc.data().displayOrder,
    name: doc.data().name,
    description: doc.data().description,
    items: doc.data().items || [],
    tags: doc.data().tags || [],
  }));
  return projectsData;
};

// プロジェクトの保存処理（差分更新を含む）
export const saveProjects = async (newProjects: ProjectContainer[]) => {
  const existingProjects = await fetchProjects();

  // 差分の確認と処理
  const existingProjectIds = new Set(existingProjects.map((p) => p.id));

  for (const project of newProjects) {
    const projectRef = doc(db, "project", String(project.id));

    if (existingProjectIds.has(project.id)) {
      // 更新処理
      await updateDoc(projectRef, {
        displayOrder: project.displayOrder,
        name: project.name,
        description: project.description,
        items: project.items,
        tags: project.tags,
      });
    } else {
      // 新規追加処理
      await setDoc(projectRef, project);
    }
  }

  // コレクションに存在するが、新しいデータに存在しないプロジェクトを削除
  const newProjectIds = new Set(newProjects.map((p) => p.id));
  for (const project of existingProjects) {
    if (!newProjectIds.has(project.id)) {
      const projectRef = doc(db, "project", String(project.id));
      await deleteDoc(projectRef);
    }
  }
};
