import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import clsx from "clsx";
import Button from "@/components/Common/Button";
import { UniqueIdentifier } from "@dnd-kit/core";
import { RiDragMove2Line } from "react-icons/ri";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

interface ContainerProps {
  id: UniqueIdentifier;
  children: React.ReactNode;
  name: string;
  description: string;
  tags: string[];
  isEditMode: boolean;
  onAddItem?: () => void;
  onIsEditChange?: () => void;
  onDeleteChange?: () => void;
}

const Container = ({
  id,
  children,
  name,
  description,
  tags,
  isEditMode,
  onAddItem,
  onIsEditChange,
  onDeleteChange,
}: ContainerProps) => {
  const {
    attributes,
    setNodeRef,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: id,
    data: {
      type: "container",
    },
  });
  return (
    <div
      {...attributes}
      ref={setNodeRef}
      style={{
        transition,
        transform: CSS.Translate.toString(transform),
        maxHeight: "640px",
        overflowY: "auto",
        overflowX: "hidden",
      }}
      className={clsx(
        "w-full h-full p-4 bg-gray-100 rounded-xl flex flex-col gap-y-4",
        isDragging && "opacity-50"
      )}
    >
      <div className="flex justify-between">
        <h1 className="text-gray-800 text-xl font-bold">{name}</h1>
        <div className="flex items-center gap-2">
          {isEditMode && (
            <div className="flex items-center gap-2">
              <button
                className="border p-2 text-md text-rose-700 bg-white rounded-xl  hover:shadow-xl hover:cursor-pointer"
                onClick={onDeleteChange}
              >
                <MdDelete />
              </button>
              <button
                className="border p-2 text-md text-teal-600 bg-white rounded-xl  hover:shadow-xl hover:cursor-pointer"
                onClick={onIsEditChange}
              >
                <MdModeEdit />
              </button>
              <button
                className="border p-2 text-md text-amber-600 bg-white rounded-xl  hover:shadow-xl hover:cursor-pointer"
                {...listeners}
              >
                <RiDragMove2Line />
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-y-1">
        <p className="text-gray-700 text-sm">{description}</p>
      </div>
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <div
              key={tag}
              className="flex items-center bg-sky-100 px-3 py-1 rounded-full"
            >
              <span className="text-xs">{tag}</span>
            </div>
          ))}
        </div>
      )}

      {children}
      <Button
        className="bg-secondary"
        onClick={onAddItem}
        disabled={!isEditMode}
      >
        メンバ追加
      </Button>
    </div>
  );
};

export default Container;
