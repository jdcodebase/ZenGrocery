const ResultBox = ({ result }) => {
  if (!result) return null;

  return (
    <div className="p-3 bg-green-100 rounded text-center font-semibold">
      {result}
    </div>
  );
};

export default ResultBox;
