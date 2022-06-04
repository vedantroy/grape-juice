import Help from "~/components/help.md";

export default function () {
  return (
    <div className="flex flex-row justify-center pt-8 bg-gray-900">
      <div className="prose prose-invert">
        <Help />
      </div>
    </div>
  );
}
