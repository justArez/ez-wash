import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  CreditCard,
  Plus,
  Trash2,
  Edit2,
  RefreshCw,
  X,
  AlertCircle,
  CheckCircle2,
  QrCode,
  Building2,
  Copy,
  Check,
  Search,
} from "lucide-react";
import type {
  BankingInfo,
  CreateBankingInfoInput,
} from "@/models/banking.model";
import {
  fetchAdminBankingInfos,
  createAdminBankingInfo,
  updateAdminBankingInfo,
  deleteAdminBankingInfo,
} from "@/services/admin.service";
import "./admin-banking.page.scss";

// Popular Vietnamese banks for quick selection
const POPULAR_BANKS = [
  { code: "vietcombank", name: "Vietcombank (VCB)" },
  { code: "MB", name: "MBBank (Military Bank)" },
  { code: "techcombank", name: "Techcombank (TCB)" },
  { code: "ACB", name: "ACB (Asia Commercial Bank)" },
  { code: "vietinbank", name: "VietinBank" },
  { code: "bidv", name: "BIDV" },
  { code: "VPBank", name: "VPBank" },
  { code: "tpbank", name: "TPBank" },
  { code: "sacombank", name: "Sacombank" },
  { code: "HDBank", name: "HDBank" },
];

export default function AdminBankingPage() {
  const [bankingList, setBankingList] = useState<BankingInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Active" | "Inactive"
  >("All");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<BankingInfo | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<CreateBankingInfoInput>({
    bankCode: "vietcombank",
    bankName: "Vietcombank",
    bankBranch: "",
    accountNumber: "",
    accountHolder: "",
    qrTemplate: "compact2",
    isActive: true,
    note: "",
  });

  const loadBankingInfos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAdminBankingInfos();
      setBankingList(data || []);
    } catch (err: any) {
      console.error("Failed to load banking info:", err);
      setError(err?.message || "Failed to load banking accounts.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBankingInfos();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingItem(null);
    setFormData({
      bankCode: "vietcombank",
      bankName: "Vietcombank",
      bankBranch: "",
      accountNumber: "",
      accountHolder: "",
      qrTemplate: "compact2",
      isActive: true,
      note: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: BankingInfo) => {
    setEditingItem(item);
    setFormData({
      bankCode: item.bankCode,
      bankName: item.bankName,
      bankBranch: item.bankBranch || "",
      accountNumber: item.accountNumber,
      accountHolder: item.accountHolder,
      qrTemplate: item.qrTemplate || "compact2",
      isActive: item.isActive,
      note: item.note || "",
    });
    setIsModalOpen(true);
  };

  const handleBankSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedCode = e.target.value;
    const bank = POPULAR_BANKS.find((b) => b.code === selectedCode);
    setFormData((prev) => ({
      ...prev,
      bankCode: selectedCode,
      bankName: bank ? bank.name.split(" (")[0] : selectedCode,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.bankCode ||
      !formData.accountNumber ||
      !formData.accountHolder
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    try {
      if (editingItem) {
        await updateAdminBankingInfo(editingItem.id, formData);
        setSuccess("Banking information updated successfully.");
      } else {
        await createAdminBankingInfo(formData);
        setSuccess("New banking account added successfully.");
      }
      setIsModalOpen(false);
      loadBankingInfos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to save banking information.");
    }
  };

  const handleToggleActive = async (item: BankingInfo) => {
    try {
      const nextActive = !item.isActive;
      await updateAdminBankingInfo(item.id, { isActive: nextActive });
      setSuccess(
        nextActive
          ? `Activated ${item.bankName} (deactivated other bank accounts).`
          : `Disabled ${item.bankName}.`,
      );
      loadBankingInfos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to update status.");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      await deleteAdminBankingInfo(id);
      setSuccess("Account deleted successfully.");
      loadBankingInfos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err?.message || "Failed to delete account.");
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const totalCount = bankingList.length;

  const filteredBankingList = bankingList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery.trim() ||
      item.bankName.toLowerCase().includes(q) ||
      item.bankCode.toLowerCase().includes(q) ||
      item.accountNumber.toLowerCase().includes(q) ||
      item.accountHolder.toLowerCase().includes(q) ||
      (item.bankBranch && item.bankBranch.toLowerCase().includes(q)) ||
      (item.note && item.note.toLowerCase().includes(q));

    const matchesStatus =
      statusFilter === "All" ||
      (statusFilter === "Active" ? item.isActive : !item.isActive);

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-banking-page">
      {/* Header */}
      <div className="admin-banking-page__header">
        <div>
          <h1 className="admin-banking-page__title">
            Banking & Deposit Config
          </h1>
          <p className="admin-banking-page__subtitle">
            Configure bank accounts and QR payment details used for customer
            seat deposits.
          </p>
        </div>
        <div className="admin-banking-page__actions">
          <button
            onClick={loadBankingInfos}
            disabled={loading}
            className="text-xs text-gray-600 hover:text-gray-900 bg-white border border-gray-200 rounded-md px-2.5 py-1.5 flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
          <Button
            className="admin-banking-page__primary-btn"
            onClick={handleOpenCreateModal}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Bank Account
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="admin-banking-alert admin-banking-alert--error mb-4">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {success && (
        <div className="admin-banking-alert admin-banking-alert--success mb-4">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{success}</span>
          <button onClick={() => setSuccess(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Directory Table / Grid Card */}
      <Card className="admin-banking-page__table-card">
        <CardHeader className="admin-banking-page__table-header">
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Bank Accounts Directory
            </CardTitle>
            <CardDescription className="text-xs text-gray-500">
              Showing {filteredBankingList.length} of {totalCount} configured
              accounts
            </CardDescription>
          </div>

          {/* Filter Tabs */}
          <div className="admin-banking-page__tabs">
            {(["All", "Active", "Inactive"] as const).map((st) => {
              const isSelected = statusFilter === st;
              const count =
                st === "All"
                  ? totalCount
                  : st === "Active"
                    ? bankingList.filter((b) => b.isActive).length
                    : bankingList.filter((b) => !b.isActive).length;

              return (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`admin-banking-page__tab-pill ${
                    isSelected ? "admin-banking-page__tab-pill--active" : ""
                  }`}
                >
                  {st === "All" ? "All Accounts" : st}
                  <span className="admin-banking-page__tab-count">{count}</span>
                </button>
              );
            })}
          </div>
        </CardHeader>

        <CardContent>
          {/* Toolbar */}
          <div className="admin-banking-page__toolbar">
            <div className="admin-banking-page__search-wrap">
              <Search className="admin-banking-page__search-icon" size={16} />
              <Input
                placeholder="Search by bank name, code, account number, or holder..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-banking-page__search-input"
              />
            </div>
          </div>

          {/* Body */}
          {loading ? (
            <div className="admin-banking-page__loading py-12 flex flex-col items-center justify-center text-muted-foreground">
              <RefreshCw className="w-6 h-6 animate-spin text-primary mb-2" />
              <span className="text-sm">Loading bank accounts...</span>
            </div>
          ) : filteredBankingList.length === 0 ? (
            <div className="admin-banking-page__empty py-12 text-center">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-base font-semibold text-gray-900 mb-1">
                No Bank Accounts Found
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-4">
                {bankingList.length === 0
                  ? "Add a bank account to enable VietQR and deposit payment for customers."
                  : "No bank accounts matched your filter/search criteria."}
              </p>
              {bankingList.length === 0 && (
                <Button size="sm" onClick={handleOpenCreateModal}>
                  <Plus className="w-4 h-4 mr-1.5" /> Add Bank Account
                </Button>
              )}
            </div>
          ) : (
            <div className="admin-banking-page__horizontal-grid">
              {filteredBankingList.map((item) => {
                const previewQr = `https://img.vietqr.io/image/${item.bankCode}-${item.accountNumber}-${item.qrTemplate || "compact2"}.png?accountName=${encodeURIComponent(item.accountHolder)}`;
                return (
                  <div
                    key={item.id}
                    className={`admin-banking-card ${item.isActive ? "admin-banking-card--active" : "admin-banking-card--disabled"}`}
                  >
                    {/* Header */}
                    <div className="admin-banking-card__header">
                      <div className="flex items-center gap-2.5">
                        <div className="admin-banking-card__bank-icon">
                          <CreditCard className="w-4 h-4 text-primary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-gray-900 leading-tight">
                            {item.bankName}
                          </h4>
                          <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                            {item.bankCode}
                          </span>
                        </div>
                      </div>
                      <span
                        className={`admin-banking-card__status-badge ${
                          item.isActive
                            ? "admin-banking-card__status-badge--active"
                            : "admin-banking-card__status-badge--inactive"
                        }`}
                      >
                        {item.isActive ? "Active" : "Disabled"}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="admin-banking-card__body">
                      <div className="admin-banking-card__qr-col">
                        <img
                          src={previewQr}
                          alt={`VietQR for ${item.bankName}`}
                          className="admin-banking-card__qr-img"
                          loading="lazy"
                        />
                        <span className="text-[10px] text-muted-foreground mt-1 block">
                          Template: {item.qrTemplate || "compact2"}
                        </span>
                      </div>

                      <div className="admin-banking-card__details-col">
                        <div className="admin-banking-card__field">
                          <label>Account Number</label>
                          <div className="font-mono font-bold text-sm flex items-center gap-1.5 text-gray-900">
                            {item.accountNumber}
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(item.accountNumber, item.id)
                              }
                              className="text-muted-foreground hover:text-foreground p-0.5"
                              title="Copy Account Number"
                            >
                              {copiedId === item.id ? (
                                <Check className="w-3.5 h-3.5 text-green-500" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <div className="admin-banking-card__field">
                          <label>Account Holder</label>
                          <span className="font-semibold text-xs text-gray-800">
                            {item.accountHolder}
                          </span>
                        </div>

                        {item.bankBranch && (
                          <div className="admin-banking-card__field">
                            <label>Branch</label>
                            <span className="text-xs text-muted-foreground truncate">
                              {item.bankBranch}
                            </span>
                          </div>
                        )}

                        {item.note && (
                          <div className="admin-banking-card__field">
                            <label>Note</label>
                            <span className="text-xs text-muted-foreground truncate">
                              {item.note}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="admin-banking-card__footer">
                      <button
                        type="button"
                        className="admin-banking-card__btn-toggle"
                        onClick={() => handleToggleActive(item)}
                      >
                        {item.isActive ? "Disable" : "Enable"}
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          className="admin-banking-card__action-icon-btn"
                          title="Edit"
                          onClick={() => handleOpenEditModal(item)}
                        >
                          <Edit2 className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="admin-banking-card__action-icon-btn admin-banking-card__action-icon-btn--delete"
                          title="Delete"
                          onClick={() => handleDelete(item.id, item.bankName)}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      {isModalOpen && (
        <div className="admin-banking-modal-overlay">
          <div className="admin-banking-modal rounded shadow-lg">
            <div className="admin-banking-modal__header">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold">
                  {editingItem ? "Edit Bank Account" : "Add Bank Account"}
                </h3>
              </div>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => setIsModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-banking-modal__form">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Quick Bank Preset
                  </label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.bankCode}
                    onChange={handleBankSelect}
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b.code} value={b.code}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Bank Code / Short Name{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.bankCode}
                    onChange={(e) =>
                      setFormData({ ...formData, bankCode: e.target.value })
                    }
                    placeholder="e.g. vietcombank, MB, techcombank"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Display Bank Name <span className="text-destructive">*</span>
                </label>
                <Input
                  required
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                  placeholder="e.g. Joint Stock Commercial Bank for Foreign Trade of Vietnam"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Account Number <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.accountNumber}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountNumber: e.target.value,
                      })
                    }
                    placeholder="e.g. 1029384756"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Account Holder Name{" "}
                    <span className="text-destructive">*</span>
                  </label>
                  <Input
                    required
                    value={formData.accountHolder}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        accountHolder: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="e.g. EZ WASH CAR CARE CENTER"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    Branch (Optional)
                  </label>
                  <Input
                    value={formData.bankBranch || ""}
                    onChange={(e) =>
                      setFormData({ ...formData, bankBranch: e.target.value })
                    }
                    placeholder="e.g. Da Nang Branch"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">
                    VietQR Template
                  </label>
                  <select
                    className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={formData.qrTemplate || "compact2"}
                    onChange={(e) =>
                      setFormData({ ...formData, qrTemplate: e.target.value })
                    }
                  >
                    <option value="compact2">
                      Compact 2 (Default, card style)
                    </option>
                    <option value="compact">Compact (Minimal badge)</option>
                    <option value="qr_only">QR Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">
                  Internal Note (Optional)
                </label>
                <Input
                  value={formData.note || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, note: e.target.value })
                  }
                  placeholder="e.g. Primary company receiving account"
                />
              </div>

              <div className="pt-2 flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-sm font-medium">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-primary focus:ring-primary h-4 w-4"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  Active (Display in customer deposit modal)
                </label>
              </div>

              <div className="admin-banking-modal__footer pt-4 border-t flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="admin-banking-page__primary-btn"
                >
                  {editingItem ? "Save Changes" : "Create Account"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
