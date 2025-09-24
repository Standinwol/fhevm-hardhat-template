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
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 mb-6">
      <h2 className="text-xl font-bold mb-4 text-center text-white">Wallet Connected</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="text-sm text-white/70 mb-1">Wallet Address</div>
          <div className="font-mono text-sm font-semibold text-white" title={account}>
            {formatAddress(account)}
          </div>
        </div>

        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="text-sm text-white/70 mb-1">ETH Balance</div>
          <div className="font-semibold text-lg text-white">{formatBalance(balance)} ETH</div>
        </div>

        <div className="text-center p-4 bg-white/10 rounded-xl border border-white/20">
          <div className="text-sm text-white/70 mb-1">Available Plays</div>
          <div className="font-semibold text-lg text-yellow-400">{availablePlays}</div>
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="inline-flex items-center space-x-2 text-sm text-white/70">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Connected to Lisk Sepolia Testnet</span>
        </div>
      </div>
    </div>
  );
};

export default WalletInfo;
