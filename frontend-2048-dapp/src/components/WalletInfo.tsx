import { FC } from "react";

interface WalletInfoProps {
  account: string;
  balance: string;
  availablePlays: number;
}

const WalletInfo = ({ account, balance, availablePlays }: WalletInfoProps) => {
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatBalance = (balance: string) => {
    return parseFloat(balance).toFixed(4);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-center">Wallet Information</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Wallet Address</div>
          <div className="font-mono text-sm font-semibold" title={account}>
            {formatAddress(account)}
          </div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">ETH Balance</div>
          <div className="font-semibold text-lg">{formatBalance(balance)} ETH</div>
        </div>

        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <div className="text-sm text-gray-600 mb-1">Available Plays</div>
          <div className="font-semibold text-lg text-blue-600">{availablePlays}</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-gray-600">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span>Connected to Sepolia Testnet</span>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
