import { FC } from "react";

interface TxStatus {
  type: string;
  message: string;
  hash: string;
}

interface TransactionStatusProps {
  txStatus: TxStatus;
}

const TransactionStatus = ({ txStatus }: TransactionStatusProps) => {
  if (!txStatus.type) return null;

  const getStatusClass = () => {
    switch (txStatus.type) {
      case "success":
        return "bg-green-500/20 border-green-400 text-green-300";
      case "error":
        return "bg-red-500/20 border-red-400 text-red-300";
      case "pending":
        return "bg-yellow-500/20 border-yellow-400 text-yellow-300";
      default:
        return "bg-white/10 border-white/20 text-white";
    }
  };

  const getIcon = () => {
    switch (txStatus.type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "pending":
        return "⏳";
      default:
        return "ℹ️";
    }
  };

  return (
    <div className={`mb-6 p-4 border rounded-xl backdrop-blur-sm ${getStatusClass()}`}>
      <div className="flex items-start space-x-3">
        <div className="text-xl">{getIcon()}</div>
        <div className="flex-1">
          <div className="font-semibold">{txStatus.message}</div>
          {txStatus.hash && (
            <div className="mt-2">
              <a
                href={`https://sepolia.etherscan.io/tx/${txStatus.hash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm underline hover:no-underline text-white/80 hover:text-white"
              >
                View on Etherscan: {txStatus.hash.slice(0, 10)}...{txStatus.hash.slice(-8)}
              </a>
            </div>
          )}
          {txStatus.type === "pending" && (
            <div className="mt-2">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                <span className="text-sm">Processing transaction...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionStatus;
