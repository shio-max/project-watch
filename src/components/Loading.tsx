import React from "react";

type LoadingProps = {
  show: boolean;
};

const Loading = ({ show }: LoadingProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
      <div
        className="animate-spin h-12 w-12 border-4 border-blue-500 rounded-full border-t-transparent"
        aria-label="読み込み中"
      ></div>
    </div>
  );
};

export default Loading;
