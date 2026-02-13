import './style.css'
import { AppConfig, UserSession, showConnect } from '@stacks/connect';
import {
  StacksMainnet,
  StacksTestnet
} from '@stacks/network';
import {
  AnchorMode,
  PostConditionMode,
  uintCV,
  stringAsciiCV,
  callReadOnlyFunction,
  cvToValue,
  FungibleConditionCode,
  makeStandardSTXPostCondition,
} from '@stacks/transactions';

// Configuration
const appConfig = new AppConfig(['store_write', 'publish_data']);
const userSession = new UserSession({ appConfig });
const network = new StacksMainnet(); // Change to StacksTestnet() for testing

// Placeholders for deployed contract addresses
// The USER should update these after deployment
const CONTRACT_OWNER = 'SP2F50MRY60R8DPW8T613YYAX04YV8CP06Y77J3BT'; // Example
const CONTRACTS = {
  TREASURY: 'SP2F50MRY60R8DPW8T613YYAX04YV8CP06Y77J3BT.treasury',
  DAILY_CHECKIN: 'SP2F50MRY60R8DPW8T613YYAX04YV8CP06Y77J3BT.daily-check-in',
  POB_REGISTRY: 'SP2F50MRY60R8DPW8T613YYAX04YV8CP06Y77J3BT.proof-of-builder',
  BUILDER_SBT: 'SP2F50MRY60R8DPW8T613YYAX04YV8CP06Y77J3BT.builder-sbt',
  STAKING: 'SP2F50MRY60R8DPW8T613YYAX04YV8CP06Y77J3BT.builder-staking',
  VERIFIER: 'SP2F50MRY60R8DPW8T613YYAX04YV8CP06Y77J3BT.project-verifier',
};

// UI Elements
const connectBtn = document.getElementById('connect-wallet') as HTMLButtonElement;
const userAddressSpan = document.getElementById('user-address') as HTMLSpanElement;
const userInfoDiv = document.getElementById('user-info') as HTMLDivElement;

const btnCheckin = document.getElementById('btn-checkin') as HTMLButtonElement;
const btnRegister = document.getElementById('btn-register') as HTMLButtonElement;
const btnMintSBT = document.getElementById('btn-mint-sbt') as HTMLButtonElement;
const btnStake = document.getElementById('btn-stake') as HTMLButtonElement;
const githubInput = document.getElementById('github-input') as HTMLInputElement;

const repScoreElem = document.getElementById('rep-score') as HTMLSpanElement;
const totalSpentElem = document.getElementById('total-spent') as HTMLSpanElement;
const checkinCountElem = document.getElementById('checkin-count') as HTMLSpanElement;
const treasuryTotalElem = document.getElementById('treasury-total') as HTMLSpanElement;

// Initialization
function init() {
  if (userSession.isUserSignedIn()) {
    const userData = userSession.loadUserData();
    showUserDetails(userData.profile.stxAddress.mainnet);
    refreshData();
  }

  connectBtn.addEventListener('click', handleConnect);
  btnCheckin.addEventListener('click', handleCheckin);
  btnRegister.addEventListener('click', handleRegister);
  btnMintSBT.addEventListener('click', handleMintSBT);
  btnStake.addEventListener('click', handleStake);
}

// Wallet Logic
async function handleConnect() {
  showConnect({
    appDetails: {
      name: 'ProofOfBuilder',
      icon: window.location.origin + '/vite.svg',
    },
    redirectTo: '/',
    onFinish: () => {
      const userData = userSession.loadUserData();
      showUserDetails(userData.profile.stxAddress.mainnet);
      notify('Wallet Connected!');
      refreshData();
    },
    userSession,
  });
}

function showUserDetails(address: string) {
  connectBtn.classList.add('hidden');
  userInfoDiv.classList.remove('hidden');
  userAddressSpan.textContent = address.substring(0, 6) + '...' + address.substring(address.length - 4);
}

// Contract Interactions
async function handleCheckin() {
  if (!userSession.isUserSignedIn()) return notify('Please connect wallet first', 'error');

  const fee = 30000; // 0.03 STX
  const address = userSession.loadUserData().profile.stxAddress.mainnet;

  try {
    await (window as any).StacksProvider.authenticationRequest({
      contractAddress: CONTRACTS.DAILY_CHECKIN.split('.')[0],
      contractName: CONTRACTS.DAILY_CHECKIN.split('.')[1],
      functionName: 'check-in',
      functionArgs: [],
      postConditions: [
        makeStandardSTXPostCondition(address, FungibleConditionCode.Equal, fee)
      ],
      onFinish: (data: any) => {
        notify('Transaction Broadcasted!');
        console.log('TX:', data.txId);
      }
    });
  } catch (e) {
    console.error(e);
    notify('Failed to trigger transaction', 'error');
  }
}

async function handleRegister() {
  const github = githubInput.value.trim();
  if (!github) return notify('Please enter GitHub username');
  if (!userSession.isUserSignedIn()) return notify('Please connect wallet first', 'error');

  const fee = 50000; // 0.05 STX
  const address = userSession.loadUserData().profile.stxAddress.mainnet;

  try {
    // Using openContractCall from @stacks/connect
    const { openContractCall } = await import('@stacks/connect');
    await openContractCall({
      network,
      contractAddress: CONTRACTS.POB_REGISTRY.split('.')[0],
      contractName: CONTRACTS.POB_REGISTRY.split('.')[1],
      functionName: 'register-builder',
      functionArgs: [stringAsciiCV(github)],
      postConditions: [
        makeStandardSTXPostCondition(address, FungibleConditionCode.Equal, fee)
      ],
      onFinish: (data) => {
        notify('Registration Broadcasted!');
        console.log('TX:', data.txId);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

async function handleMintSBT() {
  if (!userSession.isUserSignedIn()) return notify('Please connect wallet first', 'error');
  const fee = 70000; // 0.07 STX
  const address = userSession.loadUserData().profile.stxAddress.mainnet;

  try {
    const { openContractCall } = await import('@stacks/connect');
    await openContractCall({
      network,
      contractAddress: CONTRACTS.BUILDER_SBT.split('.')[0],
      contractName: CONTRACTS.BUILDER_SBT.split('.')[1],
      functionName: 'mint-sbt',
      functionArgs: [],
      postConditions: [
        makeStandardSTXPostCondition(address, FungibleConditionCode.Equal, fee)
      ],
      onFinish: (data) => notify('Minting Broadcasted!')
    });
  } catch (e) { }
}

async function handleStake() {
  if (!userSession.isUserSignedIn()) return notify('Please connect wallet first', 'error');
  const actionFee = 40000; // 0.04 STX
  const stakeAmount = 1000000; // 1 STX min
  const address = userSession.loadUserData().profile.stxAddress.mainnet;

  try {
    const { openContractCall } = await import('@stacks/connect');
    await openContractCall({
      network,
      contractAddress: CONTRACTS.STAKING.split('.')[0],
      contractName: CONTRACTS.STAKING.split('.')[1],
      functionName: 'stake-stx',
      functionArgs: [uintCV(stakeAmount)],
      postConditions: [
        makeStandardSTXPostCondition(address, FungibleConditionCode.Equal, stakeAmount + actionFee)
      ],
      onFinish: (data) => notify('Staking Broadcasted!')
    });
  } catch (e) { }
}

// Read Data Logic
async function refreshData() {
  if (!userSession.isUserSignedIn()) return;
  const address = userSession.loadUserData().profile.stxAddress.mainnet;

  try {
    // Get Stats from Registry
    const repResult = await callReadOnlyFunction({
      network,
      contractAddress: CONTRACTS.POB_REGISTRY.split('.')[0],
      contractName: CONTRACTS.POB_REGISTRY.split('.')[1],
      functionName: 'get-builder',
      functionArgs: [stringAsciiCV(address)], // Note: Principal CV should be used, but simplified for now
      senderAddress: address
    });
    // Update UI (simplified, error handling needed)
    console.log('Registry Data:', repResult);

    // Get Total Spent from Treasury
    // ... logic to call treasury get-total-spent
  } catch (e) {
    console.log('Contracts not deployed or network error');
  }
}

// Utilities
function notify(msg: string, type: 'info' | 'error' = 'info') {
  const container = document.getElementById('notifications')!;
  const toast = document.createElement('div');
  toast.className = `notification ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

init();
