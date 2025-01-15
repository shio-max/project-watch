import Modal from "@/components/Common/Modal";
import Input from "@/components/Common/Input";
import Textarea from "@/components/Common/Textarea";
import Button from "@/components/Common/Button";
import { useEffect, useState } from "react";

type AddProjectModalProps = {
  showModal: boolean;
  projectName: string;
  projectDescription: string;
  tags: string[];
  hasError: boolean;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onTagsChange: (value: string[]) => void;
  onValidationChange: (hasError: boolean) => void;
  onAddProject: () => void;
  onEditProject: () => void;
  isEdit: boolean;
  onClose: () => void;
};

const ProjectModal = ({
  showModal,
  projectName,
  projectDescription,
  tags,
  hasError,
  onNameChange,
  onDescriptionChange,
  onTagsChange,
  onValidationChange,
  onAddProject,
  onEditProject,
  isEdit,
  onClose,
}: AddProjectModalProps) => {
  const [tagInput, setTagInput] = useState("");
  const [shouldSave, setShouldSave] = useState(false);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      onTagsChange([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTag();
    } else if (event.key === "Backspace" && tagInput === "") {
      onTagsChange(tags.slice(0, -1)); // 最後のタグを削除
    }
  };

  const handleSave = () => {
    // 入力値が残っていれば、追加ボタン押下時にタグに追加する
    if (tagInput) {
      handleAddTag();
      // タグに追加後に保存処理を動かしたいため、フラグを立てる
      setShouldSave(true);
    } else {
      saveProject();
    }
  };

  const saveProject = () => {
    if (isEdit) {
      onEditProject();
    } else {
      onAddProject();
    }
    onClose();
  };

  useEffect(() => {
    if (shouldSave) {
      saveProject();
      setShouldSave(false);
    }
  }, [tags]);
  return (
    <Modal showModal={showModal}>
      <div className="flex flex-col w-full items-start gap-y-4 p-5">
        <p className="text-gray-800 text-2xl font-bold">
          {isEdit ? "プロジェクト編集" : "プロジェクト追加"}
        </p>
        <Input
          type="text"
          placeholder="プロジェクト名*"
          name="projectName"
          value={projectName}
          onChange={(e) => onNameChange(e.target.value)}
          validations={[
            {
              validate: (value: string) => value.trim().length > 0,
              message: "プロジェクト名は必須項目です",
            },
          ]}
          onValidationChange={onValidationChange}
        />
        <Textarea
          placeholder="プロジェクト概要"
          name="projectDescription"
          value={projectDescription}
          onChange={(e) => onDescriptionChange(e.target.value)}
        />
        <div className="flex flex-col w-full">
          <p className="py-2">
            技術スタック
            <span className="text-xs">
              （Enter押下で複数のタグを追加できます。）
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag: string) => (
              <div
                key={tag}
                className="flex items-center bg-gray-200 px-3 py-1 rounded-full"
              >
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-red-500"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Input
              type="text"
              name="tagInput"
              placeholder="例：Java"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
        </div>

        <div className="w-full px-4 py-3 flex justify-between">
          <Button className="bg-gray" onClick={onClose}>
            キャンセル
          </Button>
          <Button
            className="bg-primary"
            disabled={hasError || !projectName}
            onClick={handleSave}
          >
            {isEdit ? "編集" : "追加"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ProjectModal;
