type ValidationRule = {
  validate: (value: string) => boolean;
  message: string;
};

/**
 * バリデーションを実行し、結果を返す共通関数
 * @param value 検証対象の値
 * @param validations バリデーションルールの配列
 * @returns { hasError: boolean; errorMessage: string | null }
 */
export const validateValue = (
  value: string,
  validations: ValidationRule[]
): { hasError: boolean; errorMessage: string | null } => {
  for (const rule of validations) {
    if (!rule.validate(value)) {
      return { hasError: true, errorMessage: rule.message };
    }
  }
  return { hasError: false, errorMessage: null };
};
