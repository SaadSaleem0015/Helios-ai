import { useNavigate } from "react-router-dom";
import { PrivacyPolicyModal } from "../Components/PrivacyPolicyModal";

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <PrivacyPolicyModal
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  );
}

