import Guide from "../components/ui/guide";

// Redundant code pero it works man gud
type MainMenuProps = {
  onStart: (state: "menu" | "quiz" | "category") => void;
};
export default function MainMenu({ onStart }: MainMenuProps) {
  const handleClick = () => {
    onStart("category");
  };

  return (
    <>
      <div className="flex items-center justify-center w-full"
      >
        

        {/* Guide component, merge the start game button and card in the guide.tsx */}
        <Guide onStart={handleClick} />

      </div>
    </>
  );
}
