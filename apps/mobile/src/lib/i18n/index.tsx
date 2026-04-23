import AsyncStorage from "@react-native-async-storage/async-storage";
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { View, type ViewStyle } from "react-native";
import type { ComponentProps } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export type AppLocale = "en" | "ar";
export type AppDirection = "ltr" | "rtl";

const localeStorageKey = "@goal-vault/locale";

const enMessages = {
  localeLabel: "English",
  localeSwitchLabel: "Language",
  localeNativeLabel: "English",
  dateLocale: "en-US",
  navigation: {
    desktopTagline: "Premium goal vaults on Base",
    mobileTagline: "Protect one goal at a time",
    marketingLinks: {
      howItWorks: "How it works",
      security: "Security",
    },
    appLinks: {
      home: "My Vaults",
      create: "Create",
      activity: "Activity",
    },
    marketingCta: "Open app",
    appCta: "New vault",
  },
  common: {
    networkBase: "Base",
    networkBaseSepolia: "Base Sepolia",
    unsupported: "Unsupported",
    wallet: "Wallet",
    buttons: {
      openAppShell: "Open the app shell",
      seeHowItWorks: "See how it works",
      enterMyVaults: "Enter My Vaults",
      createVault: "Create vault",
      connectWallet: "Connect wallet",
      switchNetwork: "Switch network",
      disconnect: "Disconnect",
      connecting: "Connecting...",
      retry: "Retry",
      reset: "Reset",
      viewVault: "View vault",
      backToVaults: "Back to My Vaults",
      continue: "Continue",
      back: "Back",
      startOver: "Start over",
      retryDetailsSave: "Retry details save",
      fundAgain: "Fund again",
      openVault: "Open vault",
      newVault: "New vault",
      max: "Max",
      tryAgain: "Try again",
      retryDeposit: "Retry deposit",
    },
    labels: {
      transactionStatus: "Transaction status",
      transactionHash: "Transaction hash",
      vaultAddress: "Vault address",
      approvalHash: "Approval hash",
      depositHash: "Deposit hash",
      availableBalance: "Available balance",
      available: "available",
      totalSaved: "Total saved",
      vaultCount: "Vault count",
      eligibleSoon: "Eligible soon",
      withdrawWhenEligible: "Withdraw when eligible",
      recentActivity: "Recent activity",
      progress: "Progress",
      protectionRule: "Protection rule",
      timeLock: "Time lock",
      saved: "saved",
      of: "of",
      funded: "funded",
      remainingToTarget: "Remaining to target",
      goal: "Goal",
      category: "Category",
      targetAmount: "Target amount",
      unlockDate: "Unlock date",
      networkAndAsset: "Network and asset",
      depositAmount: "Deposit amount",
      accentTheme: "Accent theme",
      livePreview: "Live preview",
      connectionStatus: "Connection status",
    },
  },
  footer: {
    description:
      "Goal Vault is a calm USDC savings shell for Base. Wallet, contract, and API wiring land in later phases.",
  },
  landing: {
    heroBadge: "Base-native USDC saving",
    heroTitle: "Protect the money meant for something that matters.",
    heroSubtitle: "Create one goal, fund it in USDC, and keep withdrawals locked until the rule allows it.",
    heroHighlights: ["One goal per vault", "USDC only on Base", "Withdraw when the rule allows"],
    howItWorksEyebrow: "Three calm steps",
    howItWorksTitle: "Make saving feel deliberate again.",
    howItWorksSteps: [
      {
        title: "Name the goal",
        description: "Start with one clear purpose so progress always feels personal and concrete.",
      },
      {
        title: "Protect it with time",
        description: "Choose when it unlocks so this money is harder to break into on impulse.",
      },
      {
        title: "Fund it over time",
        description: "Deposit USDC whenever you can and watch the goal move from intention to reality.",
      },
    ],
    securityEyebrow: "Trust model",
    securityTitle: "Serious withdrawals start with clear rules.",
    securityDescription:
      "Goal Vault keeps the promise narrow: Base, USDC, one goal, and one rule you can understand instantly.",
    securityPrinciples: [
      {
        title: "Base-native by design",
        description: "The product stays narrow: one network, one asset, and one clear saving experience.",
      },
      {
        title: "Rule clarity first",
        description: "Your vault always tells you what is locked, what unlocks it, and when money can move.",
      },
      {
        title: "Private goal metadata",
        description: "Display details can stay offchain while the financial rules remain onchain.",
      },
    ],
    finalCtaTitle: "Build the habit before the integrations land.",
    finalCtaDescription:
      "This phase ships the universal shell, adaptive layouts, and a clean product hierarchy for every later wallet, contract, and backend step.",
  },
  pages: {
    howItWorks: {
      eyebrow: "Product flow",
      title: "Create one vault, keep one promise clear.",
      description:
        "Goal Vault strips the product back to the moments that matter: naming the goal, protecting it with time, and funding it calmly.",
    },
    security: {
      eyebrow: "Security",
      title: "A narrow trust model is easier to understand.",
      description: "The shell is intentionally calm and factual: Base only, USDC only, and rule-based withdrawal clarity.",
    },
    myVaults: {
      eyebrow: "My Vaults",
      title: "Protect the money meant for something real.",
      description: "A calm view of progress, rules, and upcoming withdrawal eligibility.",
      emptyTitle: "No vaults yet",
      emptyDescription: "Create your first protected vault now to start saving toward one goal with a real unlock date.",
    },
    activity: {
      eyebrow: "Activity",
      title: "Every vault movement in one calm timeline.",
      description:
        "Confirmed deposits appear here immediately from the app session while fuller indexed history lands in a later phase.",
      emptyDescription: "Confirmed deposits and future indexed activity will appear here.",
    },
    vaultDetail: {
      eyebrow: "Vault Detail",
      title: "One place for progress, rules, and next actions.",
      description: "Track the live vault, its unlock rule, and the current metadata state without leaving the same route.",
      notAvailableTitle: "Vault not available",
      notAvailableDescription:
        "The requested vault could not be resolved from the supported chain reads or the fallback dataset.",
    },
    createVault: {
      eyebrow: "Create Vault",
      title: "Protect one goal with a simple time rule.",
      description: "Create a vault on Base, save the goal details, and start funding it later in USDC.",
      stateBanner:
        "A vault is created onchain, deposits stay open later, and withdrawals only become eligible after the unlock date.",
      missingFactory:
        "Goal VaultFactory is not configured for this network yet. Set the factory address before creating vaults.",
      steps: ["Goal", "Rule", "Review"],
      goalSectionTitle: "What are you saving for?",
      goalSectionDescription: "Keep the goal specific enough that progress feels emotionally meaningful.",
      ruleSectionTitle: "Protect this goal",
      ruleSectionDescription: "This first rule keeps things simple: the vault stays locked until the selected date.",
      reviewSectionTitle: "Review the vault",
      reviewSectionDescription: "You are creating the vault now. The wallet will ask for confirmation next.",
      timeLockOnly: "Time lock only",
      timeLockDescription: "Deposits can happen later. Withdrawals only become eligible after the unlock date.",
      fields: {
        goalName: "Goal name",
        goalNamePlaceholder: "Emergency Reserve",
        goalNameHelper: "Examples: Emergency reserve, Umrah fund, Studio upgrade",
        targetAmount: "Target amount",
        targetAmountHelper: "Use whole or decimal USDC amounts.",
        category: "Category",
        categoryPlaceholder: "Home, Family, Travel",
        categoryHelper: "Optional. Keep it short and useful.",
        note: "Short note",
        notePlaceholder: "Six months of living costs, protected until late summer.",
        noteHelper: "Optional context that keeps the goal vivid.",
        unlockDate: "Unlock date",
        unlockDatePlaceholder: "2026-08-30",
        unlockDateHelper: "Use the date after which withdrawals can become eligible.",
      },
      preview: {
        emptyGoal: "Your next milestone",
        emptyNote: "Protect this goal with a clear unlock date.",
        chooseUnlockDate: "Choose an unlock date",
      },
      accentThemes: {
        sand: "Sand",
        sage: "Sage",
        sky: "Sky",
        terracotta: "Terracotta",
      },
      success: {
        eyebrow: "Vault created successfully",
        description: "Your vault is now active and protected by its unlock date.",
      },
      error: {
        activeTitle: "Your vault is active onchain",
        failedTitle: "Vault creation needs attention",
        activeDescription: "The vault was created, but Goal Vault still needs to finish the display setup.",
        failedDescription: "Review the state and try again when you are ready.",
      },
      runtime: {
        connectBeforeCreate: "Connect a wallet on Base or Base Sepolia before creating a vault.",
        providerUnavailable: "A wallet provider is not ready yet. Reconnect the wallet and try again.",
        walletRejected: "Wallet confirmation was rejected. You can review the vault and try again.",
        createFailed: "Vault creation could not be completed.",
        resolutionPending: "The vault was confirmed onchain, but its address could not be resolved yet.",
        metadataPending: "The vault is live onchain, but display details could not be saved yet.",
      },
    },
  },
  wallet: {
    runtimeWaiting: "Wallet connectivity is waiting for runtime configuration.",
    disconnected: "Connect a wallet to create and review vaults on Base.",
    unsupported:
      "The wallet is connected, but the active network is outside the supported launch set.",
    connecting: "Waiting for wallet approval.",
    ready: "Wallet and supported network are ready for vault creation and reads.",
    connectToOpenAppTitle: "Connect a wallet to open the app",
    connectToOpenAppDescription: "Connect a wallet to create and review vaults on Base or Base Sepolia.",
    switchToChain: "Switch to {chain}",
  },
  feedback: {
    unsupportedNetworkTitle: "Switch to Base or Base Sepolia",
    unsupportedNetworkDescription: "Goal Vault reads are only enabled on Base and Base Sepolia.",
    unsupportedNetworkDescriptionWithLabel:
      "{label} is connected right now. Goal Vault reads are only enabled on Base and Base Sepolia.",
    metadataLiveTitle: "Your vault is live",
    metadataPendingDescription: "This vault is active onchain. Goal details are still syncing into the app.",
    metadataFailedDescription: "This vault is active onchain, but its display details still need to be saved from the create flow.",
  },
  vaults: {
    status: {
      active: "Your vault is active",
      locked: "Withdrawals locked",
      unlocked: "Withdraw when eligible",
      withdrawn: "Funds withdrawn",
      closed: "Vault closed",
    },
    detailSaved: "{amount} saved",
    protectionRuleUnlocksOn: "Unlocks on {date}",
    withdrawalsStaySerious: "Withdrawals stay serious",
    availableAmount: "{amount} available",
    noFundsAvailable: "No funds available yet",
    activityEmpty: "New deposits will appear here after they confirm onchain.",
  },
  createVaultState: {
    idleTitle: "Protect this goal",
    idleDescription: "Create the vault now and start depositing USDC later.",
    validatingTitle: "Checking your vault details",
    validatingDescription: "Make sure the goal, amount, and unlock date are ready before you continue.",
    awaitingWalletTitle: "Waiting for wallet confirmation",
    awaitingWalletDescription: "Approve the create action in your wallet to open the vault on Base.",
    submittingTitle: "Submitting your vault",
    submittingDescription: "Your wallet approved the action. The transaction is being sent now.",
    confirmingTitle: "Your vault is being created",
    confirmingDescription: "The transaction is onchain now. This can take a short moment on Base.",
    confirmedTitle: "Vault confirmed onchain",
    confirmedDescription: "The vault contract is active. Goal Vault is resolving its new address.",
    metadataSavingTitle: "Saving your vault details",
    metadataSavingDescription: "The onchain vault is live. Goal details are being linked for display next.",
    successTitle: "Vault created successfully",
    successDescription: "Your vault is now active and protected by its unlock date.",
    failedOnchainTitle: "Vault created, details still need repair",
    failedTitle: "Vault creation did not finish",
    failedOnchainDescription: "The vault is live onchain, but Goal Vault still needs to finish the display setup.",
    failedDescription: "You can review the state below and try again when you are ready.",
  },
  deposit: {
    panelTitle: "Fund this vault",
    panelDescription: "Deposit USDC anytime. Withdrawals stay serious and time-locked.",
    amountHelper: "Enter a positive amount and keep it within your wallet balance.",
    amountPrompt: "Enter an amount of USDC.",
    amountInvalid: "Enter a valid USDC amount.",
    amountDecimals: "USDC supports up to 6 decimal places.",
    amountPositive: "Enter an amount greater than zero.",
    amountTooHigh: "Amount exceeds your available USDC balance.",
    readinessLoading: "USDC readiness is still being checked.",
    walletToDeposit: "Connect a wallet on Base or Base Sepolia to deposit.",
    switchNetwork: "Switch to Base or Base Sepolia to deposit.",
    walletLoading: "Wallet readiness is still loading.",
    openOnSameNetwork: "Open this vault on the same network where it was created.",
    unsupportedAsset: "This vault is not configured for the supported USDC asset.",
    balanceUnavailable: "USDC balance is unavailable right now.",
    approvalUnavailable: "USDC approval readiness is unavailable right now.",
    loadingBalance: "Loading balance",
    balanceUnavailableShort: "Balance unavailable",
    afterDeposit: "After this deposit",
    afterDepositDescription:
      "Your vault would hold {amount} and sit at {progress} of the goal.",
    remainingToTarget: "Remaining to target: {amount}",
    approvalRequiredTitle: "Approve USDC to fund this vault",
    approvalRequiredDescription: "Approve USDC once so this vault can receive the amount you choose.",
    approvalInProgressTitle: "Approval in progress",
    approvalInProgressDescription:
      "This allows the vault to receive the amount you chose. Your deposit still needs its own confirmation after this step.",
    approvalConfirmedTitle: "Approval confirmed",
    approvalConfirmedDescription: "You can now deposit into this vault.",
    successTitle: "Your vault has been funded",
    successDescription: "The latest vault balance and progress are now reflected below.",
    successProgress: "You are now {progress} of the way to your goal.",
    approvalErrorReadyTitle: "Approval is ready",
    approvalErrorTitle: "Deposit did not finish",
    approvalErrorDescription: "Approval already succeeded, so you can retry the deposit without approving again.",
    errorDescription: "Review the amount and wallet state, then try again.",
    flow: {
      idleTitle: "Fund this vault",
      idleDescription: "Deposit USDC anytime and keep the goal moving forward.",
      invalidTitle: "Enter a deposit amount",
      invalidDescription: "Check the amount and wallet state before funding this vault.",
      readyForApprovalTitle: "Approve USDC to fund this vault",
      readyForApprovalDescription: "This allows the vault to receive the amount you choose.",
      approvingTitle: "Waiting for approval in your wallet",
      approvingDescription: "Confirm the approval so this vault can receive the amount you entered.",
      approvalConfirmingTitle: "Approval submitted",
      approvalConfirmingDescription: "The approval is confirming onchain now.",
      readyForDepositTitle: "Ready to deposit",
      readyForDepositDescription: "Your USDC is ready to fund this vault.",
      readyAfterApprovalDescription: "Approval confirmed. You can now deposit into this vault.",
      depositingTitle: "Waiting for wallet confirmation",
      depositingDescription: "Confirm the deposit in your wallet to move USDC into this vault.",
      depositConfirmingTitle: "Deposit submitted",
      depositConfirmingDescription: "Your deposit is confirming onchain now.",
      successTitle: "Deposit confirmed",
      successDescription: "Your vault has been funded and the latest progress is loading now.",
      failedAfterApprovalTitle: "Approval is ready, deposit still needs attention",
      failedTitle: "Deposit could not be completed",
      failedAfterApprovalDescription: "Approval succeeded, so you can retry the deposit without approving again.",
      failedDescription: "Review the wallet state and try again when you are ready.",
    },
    actions: {
      approve: "Approve USDC",
      approving: "Approving USDC",
      deposit: "Deposit USDC",
      depositing: "Depositing USDC",
      depositAnother: "Deposit another amount",
      retry: "Try again",
      retryDeposit: "Try deposit again",
    },
    errors: {
      connectBeforeApprove: "Connect a wallet on Base or Base Sepolia before approving USDC.",
      connectBeforeDeposit: "Connect a wallet on Base or Base Sepolia before depositing.",
      approvalRejected: "Approval was rejected in your wallet. You can review the amount and try again.",
      approvalFailed: "USDC approval could not be completed.",
      depositRejected: "Deposit was rejected in your wallet. No funds moved.",
      depositFailed: "Deposit could not be completed.",
    },
    activityTitle: "Deposit confirmed",
    activitySubtitle: "{goal} received a new contribution.",
  },
  validation: {
    createVault: {
      goalNameRequired: "Add a clear goal name.",
      goalNameMax: "Keep the name concise.",
      categoryMax: "Keep the category under 32 characters.",
      noteMax: "Keep the note under 160 characters.",
      targetAmount: "Enter a target amount greater than 0.",
      unlockDate: "Choose a future unlock date.",
    },
  },
};

type AppMessages = typeof enMessages;

const arMessages: AppMessages = {
  localeLabel: "العربية",
  localeSwitchLabel: "اللغة",
  localeNativeLabel: "العربية",
  dateLocale: "ar-SA",
  navigation: {
    desktopTagline: "خزائن أهداف مميزة على Base",
    mobileTagline: "احمِ هدفاً واحداً في كل مرة",
    marketingLinks: {
      howItWorks: "كيف يعمل",
      security: "الأمان",
    },
    appLinks: {
      home: "خزائني",
      create: "إنشاء",
      activity: "النشاط",
    },
    marketingCta: "افتح التطبيق",
    appCta: "خزنة جديدة",
  },
  common: {
    networkBase: "Base",
    networkBaseSepolia: "Base Sepolia",
    unsupported: "غير مدعوم",
    wallet: "المحفظة",
    buttons: {
      openAppShell: "افتح واجهة التطبيق",
      seeHowItWorks: "اطلع على طريقة العمل",
      enterMyVaults: "ادخل إلى خزائني",
      createVault: "أنشئ خزنة",
      connectWallet: "اربط المحفظة",
      switchNetwork: "بدّل الشبكة",
      disconnect: "افصل الاتصال",
      connecting: "جارٍ الاتصال...",
      retry: "إعادة المحاولة",
      reset: "إعادة الضبط",
      viewVault: "عرض الخزنة",
      backToVaults: "العودة إلى خزائني",
      continue: "متابعة",
      back: "رجوع",
      startOver: "ابدأ من جديد",
      retryDetailsSave: "أعد حفظ التفاصيل",
      fundAgain: "موّل مرة أخرى",
      openVault: "افتح الخزنة",
      newVault: "خزنة جديدة",
      max: "الحد الأقصى",
      tryAgain: "حاول مرة أخرى",
      retryDeposit: "أعد محاولة الإيداع",
    },
    labels: {
      transactionStatus: "حالة المعاملة",
      transactionHash: "معرّف المعاملة",
      vaultAddress: "عنوان الخزنة",
      approvalHash: "معرّف الموافقة",
      depositHash: "معرّف الإيداع",
      availableBalance: "الرصيد المتاح",
      available: "متاح",
      totalSaved: "إجمالي المدخر",
      vaultCount: "عدد الخزائن",
      eligibleSoon: "تقترب من الاستحقاق",
      withdrawWhenEligible: "اسحب عند الاستحقاق",
      recentActivity: "النشاط الأخير",
      progress: "التقدّم",
      protectionRule: "قاعدة الحماية",
      timeLock: "قفل زمني",
      saved: "تم ادخاره",
      of: "من",
      funded: "مموّل",
      remainingToTarget: "المتبقي للوصول إلى الهدف",
      goal: "الهدف",
      category: "الفئة",
      targetAmount: "المبلغ المستهدف",
      unlockDate: "تاريخ الفتح",
      networkAndAsset: "الشبكة والأصل",
      depositAmount: "مبلغ الإيداع",
      accentTheme: "الطابع اللوني",
      livePreview: "معاينة مباشرة",
      connectionStatus: "حالة الاتصال",
    },
  },
  footer: {
    description: "Goal Vault واجهة ادخار هادئة بعملة USDC على Base. تكاملات المحفظة والعقود وواجهة البرمجة ستصل في مراحل لاحقة.",
  },
  landing: {
    heroBadge: "ادخار USDC أصيل على Base",
    heroTitle: "احمِ المال المخصّص لشيء مهم فعلاً.",
    heroSubtitle: "أنشئ هدفاً واحداً، موّله بعملة USDC، وأبقِ السحب مقفلاً حتى تسمح القاعدة بذلك.",
    heroHighlights: ["هدف واحد لكل خزنة", "USDC فقط على Base", "السحب عندما تسمح القاعدة"],
    howItWorksEyebrow: "ثلاث خطوات هادئة",
    howItWorksTitle: "اجعل الادخار عملاً مقصوداً من جديد.",
    howItWorksSteps: [
      {
        title: "سمِّ الهدف",
        description: "ابدأ بهدف واضح واحد حتى يبقى التقدّم شخصياً وملموساً.",
      },
      {
        title: "احمه بالوقت",
        description: "اختر وقت الفتح حتى يصعب كسر هذه الخطة بدافع لحظي.",
      },
      {
        title: "موّله تدريجياً",
        description: "أودِع USDC كلما استطعت وشاهد الهدف ينتقل من نية إلى واقع.",
      },
    ],
    securityEyebrow: "نموذج الثقة",
    securityTitle: "السحوبات الجادة تبدأ بقواعد واضحة.",
    securityDescription: "يحافظ Goal Vault على الوعد بشكل ضيق: Base وUSDC وهدف واحد وقاعدة واحدة يمكنك فهمها فوراً.",
    securityPrinciples: [
      {
        title: "مصمم خصيصاً لـ Base",
        description: "المنتج يبقى ضيق النطاق: شبكة واحدة وأصل واحد وتجربة ادخار واضحة.",
      },
      {
        title: "وضوح القاعدة أولاً",
        description: "ستخبرك الخزنة دائماً بما هو مقفل وما الذي يفتحه ومتى يمكن أن تتحرك الأموال.",
      },
      {
        title: "بيانات الهدف خاصة",
        description: "يمكن أن تبقى تفاصيل العرض خارج السلسلة بينما تبقى القواعد المالية على السلسلة.",
      },
    ],
    finalCtaTitle: "ابنِ العادة قبل وصول التكاملات.",
    finalCtaDescription: "تطلق هذه المرحلة الواجهة الموحدة والتخطيطات المتكيفة وهيكلية منتج نظيفة لكل خطوة لاحقة تتعلق بالمحفظة والعقود والخلفية.",
  },
  pages: {
    howItWorks: {
      eyebrow: "تدفق المنتج",
      title: "أنشئ خزنة واحدة وحافظ على وعد واحد واضح.",
      description: "يعيد Goal Vault المنتج إلى اللحظات المهمة فقط: تسمية الهدف، حمايته بالوقت، وتمويله بهدوء.",
    },
    security: {
      eyebrow: "الأمان",
      title: "نموذج الثقة الضيق أسهل في الفهم.",
      description: "الواجهة هادئة وواقعية عمداً: Base فقط، USDC فقط، ووضوح كامل لقواعد السحب.",
    },
    myVaults: {
      eyebrow: "خزائني",
      title: "احمِ المال المخصص لشيء حقيقي.",
      description: "عرض هادئ للتقدّم والقواعد ومواعيد أهلية السحب القادمة.",
      emptyTitle: "لا توجد خزائن بعد",
      emptyDescription: "أنشئ أول خزنة محمية الآن لتبدأ الادخار نحو هدف واحد بتاريخ فتح حقيقي.",
    },
    activity: {
      eyebrow: "النشاط",
      title: "كل حركة للخزنة في خط زمني هادئ واحد.",
      description: "تظهر الإيداعات المؤكدة هنا فوراً من جلسة التطبيق، بينما يصل السجل المفهرس الكامل في مرحلة لاحقة.",
      emptyDescription: "ستظهر هنا الإيداعات المؤكدة والنشاطات المفهرسة لاحقاً.",
    },
    vaultDetail: {
      eyebrow: "تفاصيل الخزنة",
      title: "مكان واحد للتقدّم والقواعد والخطوات التالية.",
      description: "تابع الخزنة الحية وقاعدة الفتح وحالة البيانات الحالية من نفس الصفحة.",
      notAvailableTitle: "الخزنة غير متاحة",
      notAvailableDescription: "تعذّر الوصول إلى الخزنة المطلوبة من قراءات السلسلة المدعومة أو من مجموعة البيانات الاحتياطية.",
    },
    createVault: {
      eyebrow: "إنشاء خزنة",
      title: "احمِ هدفاً واحداً بقاعدة زمنية بسيطة.",
      description: "أنشئ خزنة على Base واحفظ تفاصيل الهدف وابدأ تمويلها لاحقاً بعملة USDC.",
      stateBanner: "يتم إنشاء الخزنة على السلسلة، وتبقى الإيداعات متاحة لاحقاً، ولا يصبح السحب ممكناً إلا بعد تاريخ الفتح.",
      missingFactory: "لم يتم إعداد Goal VaultFactory لهذه الشبكة بعد. أضف عنوان المصنع قبل إنشاء الخزائن.",
      steps: ["الهدف", "القاعدة", "المراجعة"],
      goalSectionTitle: "ما الذي تدخر له؟",
      goalSectionDescription: "اجعل الهدف محدداً بما يكفي ليبقى التقدّم ذا معنى عاطفي.",
      ruleSectionTitle: "احمِ هذا الهدف",
      ruleSectionDescription: "هذه القاعدة الأولى بسيطة: تبقى الخزنة مقفلة حتى التاريخ الذي تختاره.",
      reviewSectionTitle: "راجع الخزنة",
      reviewSectionDescription: "أنت تنشئ الخزنة الآن. ستطلب المحفظة التأكيد في الخطوة التالية.",
      timeLockOnly: "قفل زمني فقط",
      timeLockDescription: "يمكن الإيداع لاحقاً. ولا يصبح السحب ممكناً إلا بعد تاريخ الفتح.",
      fields: {
        goalName: "اسم الهدف",
        goalNamePlaceholder: "صندوق الطوارئ",
        goalNameHelper: "أمثلة: صندوق الطوارئ، صندوق العمرة، تطوير الاستوديو",
        targetAmount: "المبلغ المستهدف",
        targetAmountHelper: "استخدم مبالغ USDC الصحيحة أو العشرية.",
        category: "الفئة",
        categoryPlaceholder: "المنزل، العائلة، السفر",
        categoryHelper: "اختياري. اجعله قصيراً ومفيداً.",
        note: "ملاحظة قصيرة",
        notePlaceholder: "ستة أشهر من تكاليف المعيشة محمية حتى نهاية الصيف.",
        noteHelper: "اختياري. أضف سياقاً يبقي الهدف حياً في ذهنك.",
        unlockDate: "تاريخ الفتح",
        unlockDatePlaceholder: "2026-08-30",
        unlockDateHelper: "استخدم التاريخ الذي يمكن بعده أن يصبح السحب متاحاً.",
      },
      preview: {
        emptyGoal: "محطتك القادمة",
        emptyNote: "احمِ هذا الهدف بتاريخ فتح واضح.",
        chooseUnlockDate: "اختر تاريخ الفتح",
      },
      accentThemes: {
        sand: "رملي",
        sage: "مريمي",
        sky: "سماوي",
        terracotta: "فخاري",
      },
      success: {
        eyebrow: "تم إنشاء الخزنة بنجاح",
        description: "خزنتك أصبحت الآن نشطة ومحمية بتاريخ الفتح.",
      },
      error: {
        activeTitle: "خزنتك نشطة على السلسلة",
        failedTitle: "إنشاء الخزنة يحتاج إلى مراجعة",
        activeDescription: "تم إنشاء الخزنة، لكن Goal Vault ما زال بحاجة إلى إكمال إعداد العرض.",
        failedDescription: "راجع الحالة ثم أعد المحاولة عندما تكون جاهزاً.",
      },
      runtime: {
        connectBeforeCreate: "اربط محفظة على Base أو Base Sepolia قبل إنشاء الخزنة.",
        providerUnavailable: "موفر المحفظة غير جاهز بعد. أعد ربط المحفظة ثم حاول مرة أخرى.",
        walletRejected: "تم رفض التأكيد من المحفظة. يمكنك مراجعة الخزنة ثم إعادة المحاولة.",
        createFailed: "تعذر إكمال إنشاء الخزنة.",
        resolutionPending: "تم تأكيد الخزنة على السلسلة، لكن عنوانها الجديد لم يُحل بعد.",
        metadataPending: "الخزنة حية على السلسلة، لكن تعذر حفظ تفاصيل العرض حتى الآن.",
      },
    },
  },
  wallet: {
    runtimeWaiting: "اتصال المحفظة ينتظر إعدادات التشغيل.",
    disconnected: "اربط محفظة لإنشاء الخزائن ومراجعتها على Base.",
    unsupported: "المحفظة متصلة، لكن الشبكة الحالية خارج مجموعة الإطلاق المدعومة.",
    connecting: "بانتظار موافقة المحفظة.",
    ready: "المحفظة والشبكة المدعومة جاهزتان لإنشاء الخزائن وقراءتها.",
    connectToOpenAppTitle: "اربط محفظة لفتح التطبيق",
    connectToOpenAppDescription: "اربط محفظة لإنشاء الخزائن ومراجعتها على Base أو Base Sepolia.",
    switchToChain: "بدّل إلى {chain}",
  },
  feedback: {
    unsupportedNetworkTitle: "بدّل إلى Base أو Base Sepolia",
    unsupportedNetworkDescription: "قراءات Goal Vault مفعلة فقط على Base وBase Sepolia.",
    unsupportedNetworkDescriptionWithLabel: "الشبكة المتصلة الآن هي {label}. قراءات Goal Vault مفعلة فقط على Base وBase Sepolia.",
    metadataLiveTitle: "خزنتك حية الآن",
    metadataPendingDescription: "هذه الخزنة نشطة على السلسلة. ما زالت تفاصيل الهدف تتم مزامنتها داخل التطبيق.",
    metadataFailedDescription: "هذه الخزنة نشطة على السلسلة، لكن تفاصيل العرض ما زالت بحاجة إلى الحفظ من تدفق الإنشاء.",
  },
  vaults: {
    status: {
      active: "الخزنة نشطة",
      locked: "السحوبات مقفلة",
      unlocked: "اسحب عند الاستحقاق",
      withdrawn: "تم سحب الأموال",
      closed: "الخزنة مغلقة",
    },
    detailSaved: "تم ادخار {amount}",
    protectionRuleUnlocksOn: "يُفتح في {date}",
    withdrawalsStaySerious: "السحوبات تبقى جادة",
    availableAmount: "{amount} متاح",
    noFundsAvailable: "لا توجد أموال متاحة بعد",
    activityEmpty: "ستظهر الإيداعات الجديدة هنا بعد تأكيدها على السلسلة.",
  },
  createVaultState: {
    idleTitle: "احمِ هذا الهدف",
    idleDescription: "أنشئ الخزنة الآن وابدأ الإيداع لاحقاً بعملة USDC.",
    validatingTitle: "جارٍ التحقق من تفاصيل الخزنة",
    validatingDescription: "تأكد من أن الهدف والمبلغ وتاريخ الفتح جاهزة قبل المتابعة.",
    awaitingWalletTitle: "بانتظار تأكيد المحفظة",
    awaitingWalletDescription: "وافق على عملية الإنشاء في محفظتك لفتح الخزنة على Base.",
    submittingTitle: "جارٍ إرسال الخزنة",
    submittingDescription: "وافقت المحفظة على العملية. يتم الآن إرسال المعاملة.",
    confirmingTitle: "خزنتك قيد الإنشاء",
    confirmingDescription: "المعاملة أصبحت على السلسلة الآن. قد يستغرق ذلك لحظات على Base.",
    confirmedTitle: "تم تأكيد الخزنة على السلسلة",
    confirmedDescription: "عقد الخزنة أصبح نشطاً. يقوم Goal Vault الآن بحل عنوانه الجديد.",
    metadataSavingTitle: "جارٍ حفظ تفاصيل الخزنة",
    metadataSavingDescription: "الخزنة أصبحت حية على السلسلة. يتم الآن ربط تفاصيل الهدف لأغراض العرض.",
    successTitle: "تم إنشاء الخزنة بنجاح",
    successDescription: "أصبحت خزنتك نشطة ومحمية بتاريخ الفتح.",
    failedOnchainTitle: "تم إنشاء الخزنة لكن التفاصيل تحتاج إصلاحاً",
    failedTitle: "لم يكتمل إنشاء الخزنة",
    failedOnchainDescription: "الخزنة حية على السلسلة، لكن Goal Vault ما زال بحاجة إلى إكمال إعداد العرض.",
    failedDescription: "يمكنك مراجعة الحالة أدناه ثم إعادة المحاولة عندما تكون جاهزاً.",
  },
  deposit: {
    panelTitle: "موّل هذه الخزنة",
    panelDescription: "أودِع USDC في أي وقت. السحوبات تبقى جدية ومقيدة بالوقت.",
    amountHelper: "أدخل مبلغاً موجباً وتأكد من بقائه ضمن رصيد محفظتك.",
    amountPrompt: "أدخل مبلغاً من USDC.",
    amountInvalid: "أدخل مبلغ USDC صالحاً.",
    amountDecimals: "تدعم USDC حتى 6 منازل عشرية.",
    amountPositive: "أدخل مبلغاً أكبر من الصفر.",
    amountTooHigh: "المبلغ يتجاوز رصيد USDC المتاح لديك.",
    readinessLoading: "ما زال التحقق من جاهزية USDC جارياً.",
    walletToDeposit: "اربط محفظة على Base أو Base Sepolia للإيداع.",
    switchNetwork: "بدّل إلى Base أو Base Sepolia للإيداع.",
    walletLoading: "ما زال التحقق من جاهزية المحفظة جارياً.",
    openOnSameNetwork: "افتح هذه الخزنة على نفس الشبكة التي أُنشئت عليها.",
    unsupportedAsset: "هذه الخزنة غير مهيأة لأصل USDC المدعوم.",
    balanceUnavailable: "رصيد USDC غير متاح حالياً.",
    approvalUnavailable: "حالة موافقة USDC غير متاحة حالياً.",
    loadingBalance: "جارٍ تحميل الرصيد",
    balanceUnavailableShort: "الرصيد غير متاح",
    afterDeposit: "بعد هذا الإيداع",
    afterDepositDescription: "ستحمل خزنتك {amount} وتصل إلى {progress} من الهدف.",
    remainingToTarget: "المتبقي للوصول إلى الهدف: {amount}",
    approvalRequiredTitle: "وافق على USDC لتمويل هذه الخزنة",
    approvalRequiredDescription: "وافق مرة واحدة على USDC حتى تتمكن هذه الخزنة من استلام المبلغ الذي تختاره.",
    approvalInProgressTitle: "الموافقة قيد التنفيذ",
    approvalInProgressDescription: "تسمح هذه الخطوة للخزنة باستلام المبلغ الذي اخترته. وسيظل الإيداع نفسه بحاجة إلى تأكيد مستقل بعد ذلك.",
    approvalConfirmedTitle: "تم تأكيد الموافقة",
    approvalConfirmedDescription: "يمكنك الآن الإيداع في هذه الخزنة.",
    successTitle: "تم تمويل خزنتك",
    successDescription: "انعكس الآن آخر رصيد للخزنة ونسبة التقدّم أدناه.",
    successProgress: "أنت الآن على بُعد {progress} من هدفك.",
    approvalErrorReadyTitle: "الموافقة جاهزة",
    approvalErrorTitle: "لم يكتمل الإيداع",
    approvalErrorDescription: "نجحت الموافقة بالفعل، لذا يمكنك إعادة محاولة الإيداع من دون الحاجة إلى موافقة جديدة.",
    errorDescription: "راجع المبلغ وحالة المحفظة ثم أعد المحاولة.",
    flow: {
      idleTitle: "موّل هذه الخزنة",
      idleDescription: "أودِع USDC في أي وقت وواصل دفع الهدف إلى الأمام.",
      invalidTitle: "أدخل مبلغ الإيداع",
      invalidDescription: "تحقق من المبلغ وحالة المحفظة قبل تمويل هذه الخزنة.",
      readyForApprovalTitle: "وافق على USDC لتمويل هذه الخزنة",
      readyForApprovalDescription: "هذا يسمح للخزنة باستلام المبلغ الذي تختاره.",
      approvingTitle: "بانتظار الموافقة في محفظتك",
      approvingDescription: "أكد الموافقة حتى تتمكن هذه الخزنة من استلام المبلغ الذي أدخلته.",
      approvalConfirmingTitle: "تم إرسال الموافقة",
      approvalConfirmingDescription: "تجري الآن عملية تأكيد الموافقة على السلسلة.",
      readyForDepositTitle: "جاهز للإيداع",
      readyForDepositDescription: "أصبح USDC جاهزاً لتمويل هذه الخزنة.",
      readyAfterApprovalDescription: "تم تأكيد الموافقة. يمكنك الآن الإيداع في هذه الخزنة.",
      depositingTitle: "بانتظار تأكيد المحفظة",
      depositingDescription: "أكد الإيداع في محفظتك لنقل USDC إلى هذه الخزنة.",
      depositConfirmingTitle: "تم إرسال الإيداع",
      depositConfirmingDescription: "يجري الآن تأكيد الإيداع على السلسلة.",
      successTitle: "تم تأكيد الإيداع",
      successDescription: "تم تمويل خزنتك ويجري الآن تحميل أحدث تقدّم.",
      failedAfterApprovalTitle: "الموافقة جاهزة لكن الإيداع ما زال يحتاج متابعة",
      failedTitle: "تعذر إكمال الإيداع",
      failedAfterApprovalDescription: "نجحت الموافقة، لذا يمكنك إعادة محاولة الإيداع من دون موافقة جديدة.",
      failedDescription: "راجع حالة المحفظة ثم أعد المحاولة عندما تكون جاهزاً.",
    },
    actions: {
      approve: "وافق على USDC",
      approving: "جارٍ اعتماد USDC",
      deposit: "إيداع USDC",
      depositing: "جارٍ إيداع USDC",
      depositAnother: "أودِع مبلغاً آخر",
      retry: "حاول مرة أخرى",
      retryDeposit: "أعد محاولة الإيداع",
    },
    errors: {
      connectBeforeApprove: "اربط محفظة على Base أو Base Sepolia قبل الموافقة على USDC.",
      connectBeforeDeposit: "اربط محفظة على Base أو Base Sepolia قبل الإيداع.",
      approvalRejected: "تم رفض الموافقة في محفظتك. يمكنك مراجعة المبلغ ثم إعادة المحاولة.",
      approvalFailed: "تعذر إكمال الموافقة على USDC.",
      depositRejected: "تم رفض الإيداع في محفظتك. لم تتحرك أي أموال.",
      depositFailed: "تعذر إكمال الإيداع.",
    },
    activityTitle: "تم تأكيد الإيداع",
    activitySubtitle: "استقبلت {goal} مساهمة جديدة.",
  },
  validation: {
    createVault: {
      goalNameRequired: "أضف اسماً واضحاً للهدف.",
      goalNameMax: "اجعل الاسم مختصراً.",
      categoryMax: "اجعل الفئة أقل من 32 حرفاً.",
      noteMax: "اجعل الملاحظة أقل من 160 حرفاً.",
      targetAmount: "أدخل مبلغاً مستهدفاً أكبر من 0.",
      unlockDate: "اختر تاريخ فتح مستقبلياً.",
    },
  },
};

export const localeMessages: Record<AppLocale, AppMessages> = {
  en: enMessages,
  ar: arMessages,
};

const directionByLocale: Record<AppLocale, AppDirection> = {
  en: "ltr",
  ar: "rtl",
};

export const isLocaleRtl = (locale: AppLocale) => directionByLocale[locale] === "rtl";

export const getLocaleDirection = (locale: AppLocale) => directionByLocale[locale];

export const getLocaleMessages = (locale: AppLocale) => localeMessages[locale];

export const interpolate = (template: string, values: Record<string, string | number>) =>
  Object.entries(values).reduce(
    (result, [key, value]) => result.replaceAll(`{${key}}`, String(value)),
    template,
  );

const directionalIconMap: Partial<Record<ComponentProps<typeof MaterialCommunityIcons>["name"], ComponentProps<typeof MaterialCommunityIcons>["name"]>> =
  {
    "arrow-right": "arrow-left",
    "arrow-left": "arrow-right",
    "arrow-top-right": "arrow-top-left",
    "arrow-top-left": "arrow-top-right",
    "chevron-left": "chevron-right",
    "chevron-right": "chevron-left",
  };

export const resolveDirectionalIcon = (
  icon: ComponentProps<typeof MaterialCommunityIcons>["name"] | undefined,
  isRTL: boolean,
) => {
  if (!icon || !isRTL) {
    return icon;
  }

  return directionalIconMap[icon] ?? icon;
};

export const getInlineDirection = (isRTL: boolean, reversed = false): ViewStyle["flexDirection"] =>
  isRTL ? (reversed ? "row" : "row-reverse") : reversed ? "row-reverse" : "row";

type I18nContextValue = {
  locale: AppLocale;
  isRTL: boolean;
  direction: AppDirection;
  messages: AppMessages;
  setLocale: (locale: AppLocale) => void;
  isHydrated: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

let currentLocale: AppLocale = "en";

export const getCurrentLocale = () => currentLocale;

export const getCurrentMessages = () => getLocaleMessages(currentLocale);

export const getCurrentLocaleTag = () => getCurrentMessages().dateLocale;

export const LocaleProvider = ({ children }: PropsWithChildren) => {
  const [locale, setLocaleState] = useState<AppLocale>("en");
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    currentLocale = locale;
  }, [locale]);

  useEffect(() => {
    let isActive = true;

    void AsyncStorage.getItem(localeStorageKey)
      .then((storedLocale) => {
        if (!isActive) {
          return;
        }

        if (storedLocale === "en" || storedLocale === "ar") {
          setLocaleState(storedLocale);
          currentLocale = storedLocale;
        }
      })
      .finally(() => {
        if (isActive) {
          setIsHydrated(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    void AsyncStorage.setItem(localeStorageKey, locale);
  }, [isHydrated, locale]);

  useEffect(() => {
    if (typeof document === "undefined") {
      return;
    }

    const direction = getLocaleDirection(locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = direction;
    document.body.lang = locale;
    document.body.dir = direction;
  }, [locale]);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      isRTL: isLocaleRtl(locale),
      direction: getLocaleDirection(locale),
      messages: getLocaleMessages(locale),
      setLocale: (nextLocale) => {
        currentLocale = nextLocale;
        setLocaleState(nextLocale);
      },
      isHydrated,
    }),
    [isHydrated, locale],
  );

  return (
    <I18nContext.Provider value={value}>
      <View style={{ flex: 1, direction: value.direction }}>{children}</View>
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within LocaleProvider.");
  }

  return {
    ...context,
    formatMessage: (template: string, values: Record<string, string | number>) => interpolate(template, values),
    getDirectionalIcon: (icon: ComponentProps<typeof MaterialCommunityIcons>["name"] | undefined) =>
      resolveDirectionalIcon(icon, context.isRTL),
    inlineDirection: (reversed = false) => getInlineDirection(context.isRTL, reversed),
    textAlignStart: context.isRTL ? ("right" as const) : ("left" as const),
    textAlignEnd: context.isRTL ? ("left" as const) : ("right" as const),
    justifyStart: context.isRTL ? ("flex-end" as const) : ("flex-start" as const),
    justifyEnd: context.isRTL ? ("flex-start" as const) : ("flex-end" as const),
  };
};
