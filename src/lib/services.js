import api from "./api";
import { upload } from "@imagekit/javascript";


// Auth Service
export const authService = {
  login: (email, password) =>
    api.post("/auth/login", { email, password }),
  register: (data) =>
    api.post("/auth/register", data),
  getMe: () => api.get("/auth/me"),
};

// Investment Plans Service
export const planService = {
  getAll: () => api.get("/plans"),
  getById: (id) => api.get(`/plans/${id}`),
};

// Wallet Service
export const walletService = {
  getBalance: () => api.get("/wallet/balance"),
  getTransactions: () => api.get("/wallet/transactions"),
};


// Withdrawal Service
export const withdrawalService = {
  getMyWithdrawals: () => api.get("/withdrawals/my"),
  create: (data) => api.post("/withdrawals", data),
};

// Investment Service
export const investmentService = {
  getMyInvestments: () => api.get("/investments/my"),
  create: (data) => api.post("/investments", data),
};

// Notification Service
export const notificationService = {
  getAll: () => api.get("/notifications"),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch("/notifications/read-all"),
};

// Payment Methods Service
export const paymentMethodService = {
  getActive: () => api.get("/payment-methods"),
};

// Rank Service
export const rankService = {
  getAll: () => api.get("/ranks"),
  getActive: () => api.get("/ranks/active"),
  getMyProgress: () => api.get("/ranks/my-progress"),
};

// Referral Service
export const referralService = {
  getMyReferrals: () => api.get("/auth/referrals"),
};



// Deposit Service
export const depositService = {
  getImageKitAuth: () => api.get("/imagekit/imagekit-auth"),

  uploadScreenshotToImageKit: async (file, onProgress) => {
    const { data: auth } = await api.get("/imagekit/imagekit-auth");

    const result = await upload({
      file,
      fileName: `deposit-${Date.now()}-${file.name}`,
      publicKey: auth.publicKey,
      token: auth.token,
      signature: auth.signature,
      expire: auth.expire,
      folder: "/deposits",
      useUniqueFileName: true,
      onProgress,
    });

    return result;
  },

  create: (data) => api.post("/deposits", data),
  getMyDeposits: () => api.get("/deposits/my"),
  getById: (id) => api.get(`/deposits/${id}`),
};




export default {
  auth: authService,
  plans: planService,
  wallet: walletService,
  deposits: depositService,
  withdrawals: withdrawalService,
  investments: investmentService,
  notifications: notificationService,
  paymentMethods: paymentMethodService,
  ranks: rankService,
  referrals: referralService,
};


