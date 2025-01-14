import Modal from "@/components/Common/Modal";
import Input from "@/components/Common/Input";
import Button from "@/components/Common/Button";
import Loading from "@/components/Loading";
import { useEffect, useState } from "react";
import { MemberInfo } from "@/types/member";
import { addMember, updateMember } from "@/utils/firebase/member";

type MemberModalProps = {
  isEdit: boolean;
  selectedMember: MemberInfo | null;
  onClose: () => void;
  onSaveSuccess: () => void;
};

const MemberModal = ({
  isEdit,
  selectedMember,
  onClose,
  onSaveSuccess,
}: MemberModalProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [belong_to, setBelongTo] = useState("");
  const [hasError, setHasError] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isEdit && selectedMember) {
      setName(selectedMember.name);
      setEmail(selectedMember.email);
      setBelongTo(selectedMember.belong_to);
      setHasError(false);
    } else {
      setName("");
      setEmail("");
      setBelongTo("");
      setHasError(true);
    }
  }, [isEdit, selectedMember]);

  useEffect(() => {
    if (!name || !email) {
      setHasError(true);
    } else {
      setHasError(false);
    }
  }, [name, email]);

  const handleSave = async () => {
    if (isEdit && selectedMember) {
      // 編集処理
      try {
        setIsLoading(true);
        await updateMember(selectedMember);
        onSaveSuccess();
      } catch (error) {
        console.error("Error updating member:", error);
        alert("編集に失敗しました。再度やり直してください。");
      } finally {
        setIsLoading(false);
      }
    } else {
      // 新規追加処理
      try {
        setIsLoading(true);
        await addMember({
          name,
          email,
          belong_to,
          isDeleted: false,
        });
        onSaveSuccess();
      } catch (error) {
        console.error("Error adding new member:", error);
        alert("追加に失敗しました。再度やり直してください。");
      } finally {
        setIsLoading(false);
      }
    }
    onClose();
  };

  return (
    <>
      <Loading show={isLoading} />

      <Modal showModal={true}>
        <div className="flex flex-col w-full items-start gap-y-4 p-5">
          <p className="text-gray-800 text-2xl font-bold">
            {isEdit ? "メンバ編集" : "メンバ追加"}
          </p>
          <Input
            type="text"
            placeholder="名前*"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            validations={[
              {
                validate: (value: string) => value.trim().length > 0,
                message: "名前は必須項目です",
              },
            ]}
            onValidationChange={setHasError}
          />
          <Input
            type="text"
            placeholder="メールアドレス*"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            validations={[
              {
                validate: (value: string) => value.trim().length > 0,
                message: "メールアドレスは必須項目です",
              },
            ]}
            onValidationChange={setHasError}
          />
          <Input
            type="text"
            placeholder="所属"
            name="belong_to"
            value={belong_to}
            onChange={(e) => setBelongTo(e.target.value)}
          />

          <div className="w-full px-4 py-3 flex justify-between">
            <Button className="bg-gray" onClick={onClose}>
              キャンセル
            </Button>
            <Button
              className="bg-primary"
              disabled={hasError}
              onClick={handleSave}
            >
              {isEdit ? "編集" : "追加"}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default MemberModal;
