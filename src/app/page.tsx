"use client";

import { useEffect, useState } from "react";
import {
  closestCorners,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  KeyboardSensor,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";

import Container from "@/components/Project/Container";
import Items from "@/components/Project/Item";
import Button from "@/components/Common/Button";
import ProjectModal from "@/components/Project/Dialogs/ProjectDialog";
import MemberModal from "@/components/Project/Dialogs/MemberDialog";
import { ProjectContainer, Position } from "@/types/project";
import { fetchAllMembers } from "@/utils/firebase/member";
import Loading from "@/components/Loading";
import { MemberInfo } from "@/types/member";
import { fetchProjects, saveProjects } from "@/utils/firebase/project";

const Project = () => {
  const [containers, setContainers] = useState<ProjectContainer[]>([]);
  const [originalContainers, setOriginalContainers] = useState<
    ProjectContainer[]
  >([]);
  const [currentContainerId, setCurrentContainerId] =
    useState<UniqueIdentifier>();
  const [currentItemId, setCurrentItemId] = useState<UniqueIdentifier>();
  const [projectName, setProjecName] = useState("");
  const [hasProjectModalError, setHasProjectModalError] = useState(true);
  const [projectDescription, setProjectDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [showContainerModal, setShowContainerModal] = useState(false);
  const [showItemModal, setShowItemModal] = useState(false);
  const [isProjectEdit, setIsProjectEdit] = useState(false);
  const [isMemberEdit, setIsMemberEdit] = useState(false);
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [memberList, setMemberList] = useState<MemberInfo[]>([]);
  const [filterdMemberList, setFilteredMemberList] = useState<MemberInfo[]>([]);
  const [memberId, setMemberId] = useState("");
  const [isEditMode, setIsEditMode] = useState(false);

  const generateTimestampId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 8);
  };

  // プロジェクト追加
  const handleAddProject = () => {
    if (hasProjectModalError) return;

    const newProject = {
      id: `container-${generateTimestampId()}`,
      displayOrder: containers.length,
      name: projectName,
      description: projectDescription,
      tags,
      items: [],
    };
    setContainers([...containers, newProject]);
    closeProjectModal();
  };

  // プロジェクト編集
  const handleEditProject = () => {
    if (hasProjectModalError) return;

    const updatedContainers = containers.map((container) =>
      container.id === currentContainerId
        ? {
            ...container,
            name: projectName,
            description: projectDescription,
            tags,
          }
        : container
    );

    setContainers(updatedContainers);
    closeProjectModal();
  };

  // プロジェクト削除
  const handleDeleteProject = (containerId: UniqueIdentifier) => {
    const target = containers.find((item) => item.id === containerId);
    if (!target) return;

    if (confirm(`"${target?.name}"を本当に削除してよろしいですか?`)) {
      // 削除するプロジェクトを除外したリスト
      const filteredContainer = containers.filter(
        (item) => item.id !== containerId
      );
      setContainers(filteredContainer);
    }
  };

  // モーダルが閉じる前に入力値がリセットされるのを防ぐための遅延処理
  const closeProjectModal = () => {
    setShowContainerModal(false);

    setTimeout(() => {
      setProjecName("");
      setProjectDescription("");
      setTags([]);
      setIsProjectEdit(false);
    }, 1000);
  };

  const getCurrentMember = (id: string) => {
    return memberList.find((member) => member.id === id);
  };

  // コンボボックスのメンバ一覧を取得
  const getFilterdMembers = async (
    containerId: UniqueIdentifier,
    memberId?: string
  ) => {
    await getMembers();
    if (!memberList || !memberList.length) {
      setFilteredMemberList([]);
      return;
    }

    const container = containers.find((item) => item.id === containerId);

    let filteredList = structuredClone(memberList);

    // 既に選択済みのメンバは候補から除外する
    if (container && container.items.length) {
      const exsitMemberIds = container.items.map((item) => item.memberId);

      filteredList = memberList.filter((list) => {
        // memberId が指定されている場合、そのメンバは除外しない
        if (memberId && list.id === memberId) {
          return true;
        }
        return !exsitMemberIds.includes(list.id!);
      });
    }
    // 削除されたメンバは候補から除外する
    filteredList = filteredList.filter((data) => !data.isDeleted);
    setFilteredMemberList(filteredList);
  };

  const onMemberChange = (memberId: string) => {
    if (!memberId) return;
    setMemberId(memberId);
  };

  // メンバ追加
  const handleAddMember = (positions: Position[]) => {
    if (!memberId) return;

    const container = containers.find((item) => item.id === currentContainerId);
    if (!container) return;

    const newMember = {
      id: `item-${generateTimestampId()}`,
      memberId: memberId,
      positions,
    };
    container.items.push(newMember);
    setContainers([...containers]);
    closeMemberModal();
  };

  // メンバ編集
  const handleEditMember = (positions: Position[]) => {
    if (!memberId) return;

    const container = containers.find((item) => item.id === currentContainerId);
    if (!container) return;

    const updatedItems = container.items.map((item) =>
      item.id === currentItemId ? { ...item, memberId, positions } : item
    );
    container.items = updatedItems;
    setContainers([...containers]);
    closeMemberModal();
  };

  // メンバ削除
  const handleDeleteMember = (
    containerId: UniqueIdentifier,
    itemId: UniqueIdentifier,
    memberId: string
  ) => {
    const containerIndex = containers.findIndex(
      (item) => item.id === containerId
    );
    if (containerIndex === -1) return;

    const container = containers[containerIndex];

    const target = container.items.find((item) => item.id === itemId);
    if (!target) return;

    if (
      confirm(
        `"${
          getCurrentMember(memberId)?.name ?? "こちらのメンバ"
        }"を本当に削除してよろしいですか?`
      )
    ) {
      // 削除するメンバを除外したリスト
      const filteredItems = container.items.filter(
        (item) => item.id !== itemId
      );

      // `containers` 配列を更新
      const updatedContainers = [...containers];
      updatedContainers[containerIndex] = {
        ...container,
        items: filteredItems,
      };

      setContainers(updatedContainers);
    }
  };

  const closeMemberModal = () => {
    setShowItemModal(false);

    // モーダルが閉じる前に入力値がリセットされるのを防ぐための遅延処理
    setTimeout(() => {
      setMemberId("");
      setPositions([]);
      setIsMemberEdit(false);
    }, 1000);
  };

  // ドラッグ&ドロップする時に許可する入力
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // ドラッグ対象アイテムまたはコンテナを検索する
  const findTarget = (id: UniqueIdentifier, type: "container" | "item") => {
    if (type === "container") {
      return containers.find((container) => container.id === id);
    }
    if (type === "item") {
      return containers.find((container) =>
        container.items.find((item) => item.id === id)
      );
    }
  };

  // コンテナ移動処理
  const sortContainer = (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier
  ) => {
    const activeContainer = findTarget(activeId, "container");
    const overContainer = findTarget(overId, "container");

    if (!activeContainer || !overContainer) return;

    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id
    );
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id
    );

    let newContainers = [...containers];
    // コンテナを並び替える
    newContainers = arrayMove(
      newContainers,
      activeContainerIndex,
      overContainerIndex
    );

    const reorderedContainers = newContainers.map((container, index) => ({
      ...container,
      displayOrder: index,
    }));

    setContainers(reorderedContainers);
  };

  // アイテム移動処理
  const sortItem = (activeId: UniqueIdentifier, overId: UniqueIdentifier) => {
    const activeContainer = findTarget(activeId, "item");
    const overContainer = findTarget(overId, "item");

    if (!activeContainer || !overContainer) return;

    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id
    );
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id
    );

    const activeItemIndex = activeContainer.items.findIndex(
      (item) => item.id === activeId
    );
    const overItemIndex = overContainer.items.findIndex(
      (item) => item.id === overId
    );

    if (activeContainerIndex === overContainerIndex) {
      // 同じコンテナ内の移動の場合
      const newContainers = [...containers];
      newContainers[activeContainerIndex].items = arrayMove(
        newContainers[activeContainerIndex].items,
        activeItemIndex,
        overItemIndex
      );
      setContainers(newContainers);
    } else {
      // 異なるコンテナへの移動の場合
      const newContainers = [...containers];
      const [movedItem] = newContainers[activeContainerIndex].items.splice(
        activeItemIndex,
        1
      );

      newContainers[overContainerIndex].items.splice(
        overItemIndex,
        0,
        movedItem
      );

      setContainers(newContainers);
    }
  };

  // アイテム数０の異なるコンテナへのアイテム移動処理
  const dropIntoContainer = (
    activeId: UniqueIdentifier,
    overId: UniqueIdentifier
  ) => {
    const activeContainer = findTarget(activeId, "item");
    const overContainer = findTarget(overId, "container");

    if (!activeContainer || !overContainer) return;

    const activeContainerIndex = containers.findIndex(
      (container) => container.id === activeContainer.id
    );
    const overContainerIndex = containers.findIndex(
      (container) => container.id === overContainer.id
    );

    const activeItemIndex = activeContainer.items.findIndex(
      (item) => item.id === activeId
    );

    const newContainers = [...containers];

    const [movedItem] = newContainers[activeContainerIndex].items.splice(
      activeItemIndex,
      1
    );
    newContainers[overContainerIndex].items.push(movedItem);

    setContainers(newContainers);
  };

  // ドラッグ移動時(リアルタイムでアイテムの移動を追跡)
  const handleDragMove = (event: DragMoveEvent) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    // アイテムの並び替えの場合
    if (
      active.id.toString().includes("item") &&
      over.id.toString().includes("item")
    ) {
      sortItem(active.id, over.id);
    }

    // アイテムをアイテム数０の別のコンテナに移動させた場合
    if (
      active.id.toString().includes("item") &&
      over.id.toString().includes("container")
    ) {
      dropIntoContainer(active.id, over.id);
    }
  };

  // ドラッグ終了時
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    // コンテナの並び替えの場合
    if (
      active.id.toString().includes("container") &&
      over.id.toString().includes("container")
    ) {
      sortContainer(active.id, over.id);
    }

    // アイテムの並び替えの場合
    if (
      active.id.toString().includes("item") &&
      over.id.toString().includes("item")
    ) {
      sortItem(active.id, over.id);
    }

    // アイテムをアイテム数０の別のコンテナに移動させた場合
    if (
      active.id.toString().includes("item") &&
      over.id.toString().includes("container")
    ) {
      dropIntoContainer(active.id, over.id);
    }
  };

  // プロジェクト一覧取得
  const getProjects = async () => {
    try {
      setIsLoading(true);
      const projectsData = await fetchProjects();
      setContainers(structuredClone(projectsData));
      setOriginalContainers(structuredClone(projectsData));
    } catch (error) {
      alert("データの取得に失敗しました。再度やり直してください。");
      console.error("Error fetching project list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // メンバ一覧取得
  const getMembers = async () => {
    try {
      setIsLoading(true);
      const memberData = await fetchAllMembers();
      setMemberList(memberData);
    } catch (error) {
      alert("データの取得に失敗しました。再度やり直してください。");
      console.error("Error fetching member list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 同じプロジェクト内のメンバ重複チェック関数
  // FIXME: 現在は保存処理時に重複チェックを行っているが、
  // ドラッグ＆ドロップ終了時に重複チェックを行うべき。
  const checkDuplicateMemberIds = (containers: ProjectContainer[]) => {
    for (const container of containers) {
      const memberIdSet = new Set();

      for (const item of container.items) {
        if (item.memberId) {
          if (memberIdSet.has(item.memberId)) {
            return container.name;
          }
          memberIdSet.add(item.memberId);
        }
      }
    }
    return null;
  };

  // 保存ボタン押下時の処理
  const save = async () => {
    try {
      // メンバ重複チェック
      const duplicateProjectName = checkDuplicateMemberIds(containers);
      if (duplicateProjectName) {
        alert(
          `プロジェクト "${duplicateProjectName}" でメンバーが重複しているため、保存できません。`
        );
        return;
      }

      setIsLoading(true);
      await saveProjects(containers);
      await getProjects();
      alert("変更を保存しました。");
    } catch (error) {
      console.error("Error saving project list:", error);
      alert("変更の保存に失敗しました。");
    } finally {
      setIsLoading(false);
    }

    setIsEditMode(false);
  };

  // キャンセルボタン押下時の処理
  const cancel = () => {
    // 変更を元に戻す
    setContainers(originalContainers);
    setIsEditMode(false);
  };

  useEffect(() => {
    const fetchInitData = async () => {
      try {
        await getMembers();
        await getProjects();
      } catch (error) {
        console.error("useEffect error:", error);
      }
    };

    fetchInitData();
  }, []);

  return (
    <>
      <Loading show={isLoading} />

      <div className="max-auto p-8">
        {/* コンテナ追加モーダル */}
        <ProjectModal
          showModal={showContainerModal}
          projectName={projectName}
          projectDescription={projectDescription}
          tags={tags}
          hasError={hasProjectModalError}
          onNameChange={setProjecName}
          onDescriptionChange={setProjectDescription}
          onTagsChange={setTags}
          onValidationChange={setHasProjectModalError}
          onAddProject={handleAddProject}
          onEditProject={handleEditProject}
          isEdit={isProjectEdit}
          onClose={closeProjectModal}
        />
        {/* END コンテナ追加モーダル */}

        {/* アイテム追加モーダル */}
        <MemberModal
          showModal={showItemModal}
          memberId={memberId}
          onMemberChange={onMemberChange}
          onAddMember={handleAddMember}
          onEditMember={handleEditMember}
          isEdit={isMemberEdit}
          onClose={closeMemberModal}
          positions={positions}
          memberList={filterdMemberList}
        />
        {/* END アイテム追加モーダル */}

        {isEditMode ? (
          <div className="flex items-center justify-between gap-y-2">
            <Button
              className="bg-secondary"
              onClick={() => setShowContainerModal(true)}
            >
              プロジェクト追加
            </Button>
            <div className="d-flex">
              <Button className="bg-gray mr-4" onClick={cancel}>
                キャンセル
              </Button>
              <Button className="bg-primary" onClick={save}>
                保存
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-end gap-y-2">
            <Button className="bg-primary" onClick={() => setIsEditMode(true)}>
              編集開始
            </Button>
          </div>
        )}

        <div className="mt-8">
          <div className="grid grid-cols-4 gap-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCorners}
              onDragMove={handleDragMove}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={containers.map((i) => i.id)}>
                {containers
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((container) => (
                    <Container
                      id={container.id}
                      name={container.name}
                      description={container.description}
                      tags={container.tags}
                      key={container.id}
                      isEditMode={isEditMode}
                      onAddItem={async () => {
                        await getFilterdMembers(container.id);
                        setCurrentContainerId(container.id);
                        setIsMemberEdit(false);
                        setShowItemModal(true);
                      }}
                      onIsEditChange={() => {
                        setIsProjectEdit(true);
                        setProjecName(container.name);
                        setProjectDescription(container.description);
                        setTags(container.tags);
                        setCurrentContainerId(container.id);
                        setShowContainerModal(true);
                      }}
                      onDeleteChange={() => {
                        handleDeleteProject(container.id);
                      }}
                    >
                      <SortableContext items={container.items.map((i) => i.id)}>
                        <div className="flex flex-start flex-col gap-y-4">
                          {container.items.map((item) => (
                            <Items
                              key={item.id}
                              id={item.id}
                              member={getCurrentMember(item.memberId)}
                              positions={item.positions}
                              isEditMode={isEditMode}
                              onIsEditChange={async () => {
                                await getFilterdMembers(
                                  container.id,
                                  item.memberId
                                );
                                setIsMemberEdit(true);
                                setMemberId(item.memberId);
                                setCurrentContainerId(container.id);
                                setCurrentItemId(item.id);
                                setPositions(item.positions);
                                setShowItemModal(true);
                              }}
                              onDeleteChange={() => {
                                handleDeleteMember(
                                  container.id,
                                  item.id,
                                  item.memberId
                                );
                              }}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </Container>
                  ))}
              </SortableContext>
            </DndContext>
          </div>
        </div>
      </div>
    </>
  );
};

export default Project;
