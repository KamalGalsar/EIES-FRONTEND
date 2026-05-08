import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profileService';
import { useAuthModal } from '../context/AuthModalContext';
import { useToast } from '../context/ToastContext';
import SsoButtons from './SsoButtons';

/* ---------- Steps ---------- */
const STEPS = [
  { title: 'Terms & Conditions' },
  { title: 'Run Script' },
  { title: 'Screenshots' },
  { title: 'Credentials' },
];

const SCREENSHOT_COMMENTS = [
  'Open the link and pick your account.',
  'Click the PowerShell icon.',
  'Paste the copied script.',
  'Copy the code and open the link.',
  'Paste code here.',
  'Pick your logged in account.',
  'Continue.',
  'Verify if prompt matches or not and go back to Azure.',
  'Wait for a few seconds (till script runs) and copy Client ID, Client Secret and Tenant ID and save it in a safe place.',
  'These are optional checks - search for App Registration in Azure and open it.',
  'Search for EIES and open it.',
  'Verify if IDs match.',
  'Verify Client Secret is created.',
  'Verify the given permissions.',
];

/* ---------- Copy to clipboard ---------- */
async function copyToClipboard(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export default function AuthModal() {
  const { isOpen, mode: contextMode, closeModal } = useAuthModal();
  const navigate = useNavigate();
  const { accessToken, refreshToken, user, login, markVerified } = useAuth();
  const { showToast } = useToast();
  const [mode, setMode] = useState<'signin' | 'signup'>(
    contextMode !== 'verification' ? (contextMode || 'signin') : 'signin'
  );
  const modalRef = useRef<HTMLDivElement>(null);

  // ---------- Verification wizard state ----------
  const [step, setStep] = useState(0);
  const [accepted, setAccepted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [testStatus, setTestStatus] = useState<{ type: 'success' | 'error' | 'none', message: string }>({ type: 'none', message: '' });
  const [screenshots, setScreenshots] = useState<string[]>([...SCREENSHOT_COMMENTS]);
  const [screenshotIdx, setScreenshotIdx] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // New state for expandable Terms & Privacy lists
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const screenshotPaths = Array.from({ length: 14 }, (_, idx) =>
    new URL(`../assets/img_${idx}.png`, import.meta.url).href
  );

  // Sync internal mode when modal opens (ignore verification mode)
  useEffect(() => {
    if (isOpen && contextMode && contextMode !== 'verification') {
      setMode(contextMode);
    }
  }, [isOpen, contextMode]);

  // Reset wizard when modal opens as verification
  useEffect(() => {
    if (isOpen && contextMode === 'verification') {
      setStep(0);
      setAccepted(false);
      setCopied(false);
      setClientId('');
      setClientSecret('');
      setTenantId('');
      setScreenshots([...SCREENSHOT_COMMENTS]);
      setScreenshotIdx(0);
      setIsFullscreen(false);
      setShowTerms(false);
      setShowPrivacy(false);
    }
  }, [isOpen, contextMode]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) closeModal();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // ---------- VERIFICATION PROMPT MODE (Wizard) ----------
  if (contextMode === 'verification') {
    const totalSteps = STEPS.length;
    const isFirst = step === 0;
    const isLast = step === totalSteps - 1;

    const canProgress = () => {
      if (step === 0) return accepted;
      return true;
    };

    const canAccessStep = (idx: number) => {
      if (idx === 0) return true;
      return accepted && idx <= step + 1;
    };

    const handleNext = () => {
      if (!canProgress()) return;
      if (step < totalSteps - 1) setStep((s) => s + 1);
    };

    const handleBack = () => {
      if (step > 0) setStep((s) => s - 1);
    };

    const handleTestConnection = async () => {
      if (!clientId || !clientSecret || !tenantId) {
        showToast("Please fill all fields first", "error");
        return;
      }
      setIsSubmitting(true);
      setTestStatus({ type: 'none', message: '' });
      try {
        const result = await profileService.testConnection(accessToken!, {
          ClientID: clientId.trim(),
          ClientSecret: clientSecret.trim(),
          TenantID: tenantId.trim()
        });
        if (result.success) {
          setTestStatus({ type: 'success', message: `Success! Connected to ${result.tenantDisplayName}` });
          showToast(`Successfully connected to ${result.tenantDisplayName}`, "success");
        } else {
          setTestStatus({ type: 'error', message: result.message });
          showToast(result.message, "error");
        }
      } catch (err) {
        setTestStatus({ type: 'error', message: err instanceof Error ? err.message : "Connection failed" });
        showToast("Connection failed", "error");
      } finally {
        setIsSubmitting(false);
      }
    };

    const handleSubmit = async () => {
      if (!accessToken) return;
      if (!clientId || !clientSecret || !tenantId) {
        showToast("Please fill all credentials", "error");
        return;
      }
      setIsSubmitting(true);

      try {
        await profileService.submitVerification(accessToken, {
          ClientID: clientId.trim(),
          ClientSecret: clientSecret.trim(),
          TenantID: tenantId.trim(),
        });

        // Immediately update AuthContext so dashboard becomes accessible without reload
        markVerified();

        showToast('Verification successful! You are now verified.', 'success');
        closeModal();
        navigate('/users');
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Verification failed", "error");
      } finally {
        setIsSubmitting(false);
      }
    };

    /* ---------- Script content ---------- */
    const scriptText = `# ========== Clean up existing Graph modules ==========
Write-Host "Unloading any loaded Microsoft.Graph modules..." -ForegroundColor Cyan
Get-Module -Name Microsoft.Graph* -All | Remove-Module -Force -ErrorAction SilentlyContinue

Write-Host "Uninstalling any previously installed Microsoft.Graph modules (current user)..." -ForegroundColor Yellow
Get-InstalledModule -Name Microsoft.Graph* -ErrorAction SilentlyContinue |
    Uninstall-Module -Force -ErrorAction SilentlyContinue

# ========== Install only the required sub-modules ==========
Write-Host "Installing Microsoft.Graph.Authentication and Applications..." -ForegroundColor Yellow
Install-Module Microsoft.Graph.Authentication -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck
Install-Module Microsoft.Graph.Applications     -Scope CurrentUser -Force -AllowClobber -SkipPublisherCheck

# ========== Import the sub-modules ==========
Write-Host "Importing required Microsoft.Graph sub-modules..." -ForegroundColor Cyan
Import-Module Microsoft.Graph.Authentication -Force -ErrorAction Stop
Import-Module Microsoft.Graph.Applications   -Force -ErrorAction Stop

if (-not (Get-Command Connect-MgGraph -ErrorAction SilentlyContinue)) {
    throw "Microsoft.Graph.Authentication did not load correctly."
}
if (-not (Get-Command New-MgApplication -ErrorAction SilentlyContinue)) {
    throw "Microsoft.Graph.Applications did not load correctly."
}
Write-Host "Microsoft.Graph ready." -ForegroundColor Green

# ========== Connect to Microsoft Graph ==========
Write-Host "Connecting to Microsoft Graph (sign in as Global Admin)..." -ForegroundColor Yellow
Connect-MgGraph -Scopes @(
    "Application.ReadWrite.All",
    "Directory.ReadWrite.All",
    "AppRoleAssignment.ReadWrite.All",
    "DelegatedPermissionGrant.ReadWrite.All"
) -ErrorAction Stop

if (-not (Get-MgContext)) { throw "Unable to connect to Microsoft Graph." }
$tenantId = (Get-MgContext).TenantId
Write-Host "Tenant ID: $tenantId" -ForegroundColor Green

# ========== Generate random app name ==========
$randomLetters = -join ((65..90) | Get-Random -Count 4 | ForEach-Object { [char]$_ })
$appName = "EIES-$randomLetters"
Write-Host "Creating App Registration: $appName" -ForegroundColor Yellow

$app = New-MgApplication -DisplayName $appName
$clientId = $app.AppId
$appSp = New-MgServicePrincipal -AppId $clientId
Write-Host "App created (Client ID: $clientId)" -ForegroundColor Green

# ========== Get Microsoft Graph service principal ==========
$graphSp = Get-MgServicePrincipal -Filter "AppId eq '00000003-0000-0000-c000-000000000000'"
if (-not $graphSp) { throw "Microsoft Graph service principal not found." }

# ========== Helper to look up permission IDs dynamically ==========
function Get-PermissionId($Type, $Name) {
    if ($Type -eq "Application") {
        return ($graphSp.AppRoles | Where-Object { $_.Value -eq $Name }).Id
    } else {
        return ($graphSp.Oauth2PermissionScopes | Where-Object { $_.Value -eq $Name }).Id
    }
}

# ========== Required permissions (24 total) ==========
$permissions = @(
    # Delegated
    @{Type="Delegated";   Name="Application.Read.All"},
    @{Type="Delegated";   Name="AppRoleAssignment.ReadWrite.All"},
    @{Type="Delegated";   Name="AuditLog.Read.All"},
    @{Type="Delegated";   Name="DelegatedPermissionGrant.ReadWrite.All"},
    @{Type="Delegated";   Name="Policy.ReadWrite.ConditionalAccess"},
    @{Type="Delegated";   Name="RoleManagement.Read.All"},
    @{Type="Delegated";   Name="RoleManagement.Read.Directory"},
    @{Type="Delegated";   Name="RoleManagement.ReadWrite.Directory"},
    @{Type="Delegated";   Name="User.Read"},
    # Application
    @{Type="Application"; Name="Application.Read.All"},
    @{Type="Application"; Name="Application.ReadWrite.All"},
    @{Type="Application"; Name="AppRoleAssignment.ReadWrite.All"},
    @{Type="Application"; Name="AuditLog.Read.All"},
    @{Type="Application"; Name="Directory.Read.All"},
    @{Type="Application"; Name="Directory.ReadWrite.All"},
    @{Type="Application"; Name="Group.Read.All"},
    @{Type="Application"; Name="Group.ReadWrite.All"},
    @{Type="Application"; Name="GroupMember.Read.All"},
    @{Type="Application"; Name="Policy.ReadWrite.ConditionalAccess"},
    @{Type="Application"; Name="RoleManagement.Read.All"},
    @{Type="Application"; Name="RoleManagement.Read.Directory"},
    @{Type="Application"; Name="RoleManagement.ReadWrite.Directory"},
    @{Type="Application"; Name="User.Read.All"},
    @{Type="Application"; Name="User.ReadWrite.All"}
)

# ========== Assign application permissions (app roles) ==========
Write-Host "\`nAssigning application permissions..." -ForegroundColor Cyan
foreach ($p in $permissions | Where-Object { $_.Type -eq "Application" }) {
    $permId = Get-PermissionId -Type "Application" -Name $p.Name
    if (-not $permId) {
        Write-Warning "Skipping '$($p.Name)' – not found in Microsoft Graph app roles."
        continue
    }
    $existing = Get-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id |
                Where-Object { $_.AppRoleId -eq $permId }
    if (-not $existing) {
        New-MgServicePrincipalAppRoleAssignment -ServicePrincipalId $appSp.Id -PrincipalId $appSp.Id -ResourceId $graphSp.Id -AppRoleId $permId | Out-Null
        Write-Host "  Added: $($p.Name)" -ForegroundColor Green
    } else {
        Write-Host "  Already present: $($p.Name)" -ForegroundColor DarkGray
    }
}

# ========== Grant admin consent for all delegated permissions ==========
Write-Host "\`nGranting admin consent for delegated permissions..." -ForegroundColor Cyan
$delegatedNames = ($permissions | Where-Object { $_.Type -eq "Delegated" }).Name
if ($delegatedNames.Count -gt 0) {
    $scopeString = $delegatedNames -join " "
    $params = @{
        ClientId    = $appSp.Id
        ConsentType = "AllPrincipals"
        ResourceId  = $graphSp.Id
        Scope       = $scopeString
    }
    New-MgOauth2PermissionGrant @params | Out-Null
    Write-Host "Delegated permissions consented." -ForegroundColor Green
}

# ========== Update app manifest so permissions appear under "Configured permissions" ==========
Write-Host "\`nUpdating app registration manifest (requiredResourceAccess)..." -ForegroundColor Cyan

$resourceAccess = @()
foreach ($p in $permissions) {
    $permId = Get-PermissionId -Type $p.Type -Name $p.Name
    if ($permId) {
        $resourceAccess += @{
            Id   = $permId
            Type = if ($p.Type -eq "Application") { "Role" } else { "Scope" }
        }
    }
}

$currentApp = Get-MgApplication -ApplicationId $app.Id
$requiredResourceAccess = $currentApp.RequiredResourceAccess | ForEach-Object { $_ }

$graphEntry = $requiredResourceAccess | Where-Object { $_.ResourceAppId -eq $graphSp.AppId }
if (-not $graphEntry) {
    $requiredResourceAccess += @{
        ResourceAppId  = $graphSp.AppId
        ResourceAccess = $resourceAccess
    }
} else {
    $graphEntry.ResourceAccess = $resourceAccess
}

Update-MgApplication -ApplicationId $app.Id -RequiredResourceAccess $requiredResourceAccess
Write-Host "App manifest updated. Portal will now show permissions under 'Configured permissions'." -ForegroundColor Green

# ========== Create client secret (24 months) ==========
Write-Host "\`nCreating client secret (24‑month validity)..." -ForegroundColor Cyan
$endDate = (Get-Date).AddMonths(24)
$secret = Add-MgApplicationPassword -ApplicationId $app.Id -PasswordCredential @{
    displayName = "EIES-$randomLetters-24mo"
    endDateTime = $endDate
}
$clientSecret = $secret.SecretText

# ========== Display all credentials ==========
Write-Host "\`n========================================" -ForegroundColor Green
Write-Host "       EIES App Registration Complete" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host "App Name:          $appName"
Write-Host "Client ID:         $clientId"
Write-Host "Client Secret:     $clientSecret"
Write-Host "Tenant ID:         $tenantId"
Write-Host "========================================" -ForegroundColor Green
Write-Host "\`nIMPORTANT: Copy the client secret NOW – it will NOT be shown again." -ForegroundColor Yellow
Write-Host "Secret expires on: $($endDate.ToString('yyyy-MM-dd'))"

# AFTER COPYING ABOVE SECRET - YOU MAY CLOSE THIS WINDOW`;

    const handleCopyScript = async () => {
      const success = await copyToClipboard(scriptText);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    };

    // Screenshot navigation helpers
    const prevScreenshot = () => {
      setScreenshotIdx((prev) => (prev > 0 ? prev - 1 : 13));
    };
    const nextScreenshot = () => {
      setScreenshotIdx((prev) => (prev < 13 ? prev + 1 : 0));
    };

    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        onClick={closeModal}
      >
        <div
          ref={modalRef}
          className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20 flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={() => {
              closeModal();
              if (contextMode === 'verification') {
                navigate('/');
              }
            }}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition"
            aria-label="Close"
          >
            <svg
              className="w-5 h-5 text-gray-600 dark:text-gray-300"
              fill="none" strokeLinecap="round" strokeLinejoin="round"
              strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Wizard header */}
          <div className="p-6 sm:p-8 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
            <div className="text-center">
              <div className="mb-2 flex justify-center">
                <svg
                  className="h-10 w-10 text-amber-500"
                  viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Verification Required
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Complete the steps below to verify your account.
              </p>
            </div>

            {/* Step indicator — clickable, with extra spacing */}
            <div className="flex justify-center mt-8 space-x-6 sm:space-x-10">
              {STEPS.map((s, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <button
                    onClick={() => canAccessStep(idx) && setStep(idx)}
                    disabled={!canAccessStep(idx)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition ${
                      idx <= step
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
                    } ${idx === step ? 'ring-2 ring-blue-400 ring-offset-2' : ''}`}
                    aria-label={`Go to step ${idx + 1}`}
                  >
                    {idx + 1}
                  </button>
                  <span className={`text-xs mt-2 text-center w-20 ${
                    idx <= step
                      ? 'font-semibold text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {s.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wizard body */}
          <div className="p-6 sm:p-8 flex-1 overflow-y-auto">
            {/* Step 1: Terms & Conditions */}
            {step === 0 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Terms & Conditions
                </h3>

                {/* Compact, friendly terms */}
                <div className="bg-white dark:bg-gray-800/80 border border-black/5 dark:border-white/5 rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>You’re in control.</strong> You’re responsible for keeping your credentials safe. Everything you do under your account is your responsibility.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Play fair.</strong> You agree not to misuse the service or break any laws. We can suspend accounts that violate these rules.
                    </p>
                  </div>

                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Service “as is”.</strong> We provide the platform “as is” without warranties. We’re not liable for any damages or losses from using it.
                    </p>
                  </div>

                  {/* Expandable Terms & Privacy inline */}
                  <div className="space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>By proceeding, you confirm you’ve read and agree to our{' '}
                        <button
                          type="button"
                          onClick={() => setShowTerms(!showTerms)}
                          className="text-blue-600 dark:text-blue-400 underline font-medium hover:no-underline"
                        >
                          Terms of Service
                        </button>
                        {' '}and{' '}
                        <button
                          type="button"
                          onClick={() => setShowPrivacy(!showPrivacy)}
                          className="text-blue-600 dark:text-blue-400 underline font-medium hover:no-underline"
                        >
                          Privacy Policy
                        </button>.
                      </strong>
                    </p>

                    {/* Terms of Service list */}
                    {showTerms && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-fadeIn text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <p className="font-semibold mb-1">Key Terms of Service:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>You must use the service only for lawful purposes and in compliance with all applicable laws.</li>
                          <li>You are responsible for maintaining the confidentiality of your credentials and for all activities under your account.</li>
                          <li>We reserve the right to suspend or terminate accounts that violate these terms without prior notice.</li>
                          <li>We may update these terms from time to time; continued use after changes means acceptance.</li>
                        </ul>
                      </div>
                    )}

                    {/* Privacy Policy list */}
                    {showPrivacy && (
                      <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 animate-fadeIn text-sm text-gray-700 dark:text-gray-300 space-y-2">
                        <p className="font-semibold mb-1">Key Privacy Policy:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          <li>We collect only the minimum information necessary to provide and improve the service (e.g., account details, usage logs).</li>
                          <li>Your data is stored securely and encrypted at rest and in transit. Only you can access your secrets.</li>
                          <li>We never sell your personal data to third parties. We may share it only as required by law or to protect our rights.</li>
                          <li>You can request access, correction, or deletion of your personal data at any time via your account settings or by contacting support.</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* Acceptance checkbox – unchanged */}
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={accepted}
                    onChange={(e) => setAccepted(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    I accept the terms and conditions
                  </span>
                </label>
              </div>
            )}

            {/* Step 2: Script */}
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Run Azure Graph Script
                </h3>
                <div className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Copy this PowerShell script, Then click this link to open Azure: <a
                      href="https://portal.azure.com"
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-blue-600 dark:text-blue-400 underline"
                    >https://portal.azure.com</a>, Then move to next step! 
                    It will create an app registration
                    with the required permissions and display your credentials.
                  </p>
                  {/* Script block with copy button inside */}
                  <div className="relative">
                    <pre className="bg-gray-900 dark:bg-gray-950 text-green-300 p-4 rounded-lg overflow-x-auto text-xs font-mono max-h-96">
                      {scriptText}
                    </pre>
                    <button
                      onClick={handleCopyScript}
                      className="absolute top-3 right-4 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
                    >
                      {copied ? 'Copied!' : 'Copy Script'}
                    </button>
                  </div>
                </div>
                <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-300">
                  After running the script successfully, check the output for the <strong>Client ID</strong>, <strong>Client Secret</strong> and <strong>Tenant ID</strong>. You will need them in the last step.
                </div>
              </div>
            )}

            {/* Step 3: Screenshots (one at a time) */}
            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Screenshots
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Review each verification screenshot and compare it with the step comment below.
                </p>

                {/* Screenshot viewer */}
                <div className="border border-black/10 dark:border-white/10 rounded-lg overflow-hidden">
                  <div className="bg-black/5 dark:bg-white/5 h-[360px] flex items-center justify-center overflow-hidden relative">
                    <img
                      src={screenshotPaths[screenshotIdx]}
                      alt={`Screenshot ${screenshotIdx + 1}`}
                      className="max-h-full w-auto max-w-full object-contain"
                    />
                    <button
                      onClick={prevScreenshot}
                      className="absolute left-3 top-1/2 z-20 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-gray-100/90 hover:bg-white dark:hover:bg-gray-200 text-gray-900 dark:text-gray-900 transition"
                      aria-label="Previous screenshot"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={nextScreenshot}
                      className="absolute right-3 top-1/2 z-20 -translate-y-1/2 p-3 rounded-full bg-white/90 dark:bg-gray-100/90 hover:bg-white dark:hover:bg-gray-200 text-gray-900 dark:text-gray-900 transition"
                      aria-label="Next screenshot"
                    >
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setIsFullscreen(true)}
                      className="absolute top-3 right-16 z-20 p-1.5 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-100 rounded-full border border-black/10 dark:border-white/10 shadow-sm hover:bg-white dark:hover:bg-gray-800 transition"
                      aria-label="Open screenshot fullscreen"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h6M4 4v6" />
                        <path d="M20 4h-6M20 4v6" />
                        <path d="M4 20h6M4 20v-6" />
                        <path d="M20 20h-6M20 20v-6" />
                      </svg>
                    </button>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Screenshot {screenshotIdx + 1} of {screenshotPaths.length}
                      </p>
                    </div>
                    <textarea
                      value={screenshots[screenshotIdx]}
                      readOnly
                      className="w-full bg-gray-50 dark:bg-gray-900 border border-black/10 dark:border-white/10 rounded p-3 text-sm text-gray-900 dark:text-white resize-none h-32 cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Credentials */}
            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Enter App Credentials
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Provide the Client ID, Client Secret, and Tenant ID from the PowerShell script output.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client ID
                    </label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      placeholder="e.g., 2f07f697-..."
                      className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Client Secret
                    </label>
                    <input
                      type="password"
                      value={clientSecret}
                      onChange={(e) => setClientSecret(e.target.value)}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Tenant ID
                    </label>
                    <input
                      type="text"
                      value={tenantId}
                      onChange={(e) => setTenantId(e.target.value)}
                      placeholder="e.g., 9d80caf3-..."
                      className="w-full px-3 py-2 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>

                  {/* Improved security reminder */}
                  <div className="flex items-center gap-2 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
                    </svg>
                    <span>
                      <strong>Your secrets are safe.</strong> They’re encrypted and only you can access them.
                    </span>
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isSubmitting}
                  className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 font-medium transition"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  )}
                  <span>Test Connection</span>
                </button>

                {testStatus.type !== 'none' && (
                  <div className={`p-3 rounded-lg text-xs flex items-center space-x-2 ${
                    testStatus.type === 'success' 
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300' 
                      : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                  }`}>
                    {testStatus.type === 'success' ? (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
                    ) : (
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12" /></svg>
                    )}
                    <span>{testStatus.message}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Wizard footer with Back / Next / Submit */}
          <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between">
            <button
              onClick={handleBack}
              disabled={isFirst}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                isFirst
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
              }`}
            >
              Back
            </button>

            {!isLast ? (
              <button
                onClick={handleNext}
                disabled={!canProgress()}
                className={`px-6 py-2 rounded-lg font-medium transition ${
                  !canProgress()
                    ? 'bg-blue-300 dark:bg-blue-800 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 shadow-md'
                }`}
              >
                Next
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`px-6 py-2 rounded-lg font-medium transition shadow-md ${
                  isSubmitting
                    ? 'bg-blue-300 text-white cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isSubmitting ? 'Saving...' : 'Submit Verification'}
              </button>
            )}
          </div>

          {/* ---------- FULLSCREEN SCREENSHOT OVERLAY ---------- */}
          {isFullscreen && (
            <div className="fixed inset-0 z-[110] bg-black/95 flex items-center justify-center p-4">
              {/* Close button */}
              <button
                onClick={() => setIsFullscreen(false)}
                className="absolute top-4 right-4 z-30 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                aria-label="Close fullscreen"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              {/* Left arrow */}
              <button
                onClick={prevScreenshot}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                aria-label="Previous screenshot"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right arrow */}
              <button
                onClick={nextScreenshot}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                aria-label="Next screenshot"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Image container */}
              <div className="relative max-w-full max-h-full flex items-center justify-center">
                <img
                  src={screenshotPaths[screenshotIdx]}
                  alt={`Screenshot ${screenshotIdx + 1}`}
                  className="max-h-[85vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
                />
              </div>

              {/* Bottom info / comment (read-only) */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
                <div className="bg-black/70 backdrop-blur-sm rounded-full px-4 py-2 text-white text-sm inline-flex items-center justify-between gap-4 w-full">
                  <span className="font-semibold">Screenshot comment</span>
                  <span className="text-xs text-white/70">
                    {screenshotIdx + 1} / {screenshotPaths.length}
                  </span>
                </div>
                <div className="mt-2 max-w-full">
                  <p className="inline-block bg-white/10 border border-white/20 rounded-full px-4 py-2 text-xs text-white max-w-full whitespace-normal">
                    {screenshots[screenshotIdx]}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---------- SIGN IN / SIGN UP MODE (unchanged) ----------
  const title = mode === 'signin' ? 'Welcome Back' : 'Create Account';
  const subtitle =
    mode === 'signin'
      ? 'Sign in to continue your secure identity journey'
      : 'Get started with AI-powered identity security';

  const switchMode = () => {
    setMode(mode === 'signin' ? 'signup' : 'signin');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={closeModal}
    >
      <div
        ref={modalRef}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-white/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 dark:bg-gray-800/50 hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-200 group"
          aria-label="Close"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-black/10 dark:border-white/10 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/30">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-sm sm:text-base text-black/60 dark:text-white/60 mt-2">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Body with SsoButtons */}
        <div className="p-6 sm:p-8">
          <SsoButtons mode={mode} />
          <div className="mt-6 text-center">
            <p className="text-sm text-black/60 dark:text-white/60">
              {mode === 'signin'
                ? "Don't have an account? "
                : 'Already have an account? '}
              <button
                onClick={switchMode}
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                {mode === 'signin' ? 'Create one now' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-black/10 dark:border-white/10 bg-gray-50/50 dark:bg-gray-800/50">
          <p className="text-xs text-center text-black/60 dark:text-white/60">
            By continuing, you agree to our{' '}
            <a href="/terms" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Privacy Policy
            </a>
          </p>
          <p className="text-xs text-center text-black/40 dark:text-white/40 mt-2 flex items-center justify-center gap-1">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <rect x="3" y="11" width="18" height="11" rx="2" strokeWidth="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeWidth="2" />
            </svg>
            Secured by EIES • Azure-native identity security
          </p>
        </div>
      </div>
    </div>
  );
}