import { useNavigate } from "react-router-dom";
import TermsAndConditionsModal from "./AdminPages/TermsAndConditions";

export function TermsAndConditionsPage() {
  const navigate = useNavigate();

  return (
    <TermsAndConditionsModal
      isOpen={true}
      onClose={() => navigate(-1)}
    />
  );
}

