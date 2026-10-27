/**
 * Manual QA Tester Portfolio - Nandinee Soni
 * Features: Pure Bright Theme, Interactive Bug Modal, Test Runner Simulator,
 * Live Profile Customizer, Test Matrix Filter, Form Validation & Toasts.
 */

document.addEventListener('DOMContentLoaded', () => {

  // Ensure bright light mode is the active presentation
  const htmlElement = document.documentElement;
  htmlElement.classList.add('js-loaded');
  htmlElement.removeAttribute('data-theme');
  try {
    localStorage.removeItem('qa_theme');
  } catch (e) {}

  // Dynamic Typing Subtitle in Hero Section (Ref: nehalkharadi.github.io style)
  const typingElement = document.getElementById('typing-text');
  if (typingElement) {
    const phrases = [
      'Manual QA Tester',
      'QA Specialist',
      'Software Quality Analyst',
      'Functional & UI Tester',
      'Bug Hunter'
    ];
    let phraseIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 80;

    function typeLoop() {
      const currentPhrase = phrases[phraseIndex];
      if (isDeleting) {
        typingElement.textContent = currentPhrase.substring(0, charIndex - 1);
        charIndex--;
        typingSpeed = 35;
      } else {
        typingElement.textContent = currentPhrase.substring(0, charIndex + 1);
        charIndex++;
        typingSpeed = 75;
      }

      if (!isDeleting && charIndex === currentPhrase.length) {
        typingSpeed = 1800; // Pause at end of phrase
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingSpeed = 400; // Pause before typing next phrase
      }

      setTimeout(typeLoop, typingSpeed);
    }

    typeLoop();
  }

  // ==========================================
  // 1. DATA REPOSITORY FOR DEFECT REPORTS & TEST CASES
  // ==========================================
  const bugDatabase = {
    'delawala-bug-101': {
      id: 'BUG-DEL-101',
      severity: 'CRITICAL',
      severityClass: 'pill-critical',
      status: 'Status: VERIFIED & REPORTED',
      statusClass: 'st-fail',
      project: 'Delawala Group — Real Estate ERP',
      env: 'Chrome v122 / Windows 11 / Staging v3.1',
      module: 'Unit Allotment & Payment Gateway',
      title: 'Delawala ERP: Concurrency conflict allows simultaneous token payments for the same residential unit',
      description: 'During simultaneous booking requests from two sales managers for the same premium unit (Unit 302, Delawala Heights), the database lock fails to execute atomically, resulting in two confirmed reservation tokens generated for a single physical unit.',
      steps: [
        'Log in to Delawala Group ERP portal as Property Sales Executive.',
        'Navigate to <strong>Properties → Delawala Heights → Unit Matrix</strong>.',
        'Select available 3BHK unit: <code>Unit-302</code>.',
        'Simultaneously initiate token payment checkout from two separate sessions.',
        'Submit payment authorization on both sessions within 1.5 seconds.',
        'Observe booking status and generated allotment receipts.'
      ],
      expected: 'First transaction secures atomic row lock and marks unit as "Reserved"; second transaction rejects with: "Unit currently reserved by another representative".',
      actual: 'Both transactions succeed with 200 OK; database creates duplicate allotment IDs (ALT-4081 & ALT-4082) with overlapping lease agreements.',
      apiPayload: 'POST /api/v1/properties/units/302/reserve HTTP/1.1\n{ "agentId": "DEL-AG-04", "tokenAmount": 50000 }\nStatus: 200 OK (OptimisticLockException unhandled; duplicate token receipt generated)'
    },
    'aspino-bug-201': {
      id: 'BUG-ASP-201',
      severity: 'HIGH',
      severityClass: 'pill-critical',
      status: 'Status: VERIFIED & REPORTED',
      statusClass: 'st-fail',
      project: 'Aspino — Enterprise ERP System',
      env: 'Edge v121 / Ubuntu 22.04 / QA Environment',
      module: 'Manufacturing Batch & Multi-Warehouse Dispatch',
      title: 'Aspino ERP: Multi-warehouse transfer calculation omits scrap variance on bulk batch dispatch',
      description: 'When dispatching ceramic production batches from the primary manufacturing plant to Regional Warehouse B, the system fails to deduct quality inspection scrap percentage from total dispatched weight, resulting in an unresolvable inventory reconciliation discrepancy.',
      steps: [
        'Log in to Aspino Enterprise ERP with Warehouse Supervisor credentials.',
        'Navigate to <strong>Manufacturing → Batch Management → Dispatch Transfer</strong>.',
        'Select Production Batch <code>#TRK902 (Ceramic Floor Tiles - Grade A)</code>.',
        'Enter Dispatch Quantity: <code>1,000 Boxes</code> with <code>3.5% QC Scrap Margin</code>.',
        'Execute Goods Transfer Note (GTN) to Warehouse Regional Hub.',
        'Verify physical stock intake vs recorded ERP ledger balance.'
      ],
      expected: 'ERP computes net accepted stock (965 Boxes) and logs 35 Boxes to Scrap Loss account automatically.',
      actual: 'System logs transfer as 1,000 Boxes; receiving warehouse reports 35-unit ledger shortfall, locking automated invoice generation.',
      apiPayload: 'POST /api/v2/logistics/dispatch/transfer HTTP/1.1\n{ "batchId": "TRK902", "grossQty": 1000, "scrapRate": 0.035 }\nStatus: 200 OK (Accounting ledger variance: +35 units unallocated in StockLedgerService.ts:289)'
    },
    'car-bug-301': {
      id: 'BUG-CAR-301',
      severity: 'HIGH',
      severityClass: 'pill-critical',
      status: 'Status: VERIFIED & REPORTED',
      statusClass: 'st-fail',
      project: 'Cost Free Car — Automotive Fleet ERP',
      env: 'Chrome v122 / MacOS Sonoma / Production Staging',
      module: 'Fleet Availability & Customer Booking Engine',
      title: 'Cost Free Car ERP: Vehicle marked "In Service" remains selectable in customer rental booking calendar',
      description: 'When a fleet vehicle undergoes mandatory scheduled maintenance (e.g. 2023 Toyota Camry, VIN: ABC123DEF), the maintenance module updates the vehicle status to "In Service", but the front-desk rental booking calendar fails to sync the availability blackout, allowing customers to book unserviceable vehicles.',
      steps: [
        'Log in to Cost Free Car ERP as Fleet Service Coordinator.',
        'Navigate to <strong>Maintenance Tracker → Schedule Service</strong>.',
        'Flag vehicle <code>2023 Toyota Camry (VIN: ABC123DEF)</code> for major brake service from Nov 28 to Nov 30.',
        'Switch to <strong>Rent / Bookings → Customer Reservation Calendar</strong>.',
        'Attempt to create a customer rental contract for the same vehicle over Nov 29.',
        'Observe calendar availability matrix and confirmation prompt.'
      ],
      expected: 'Vehicle displays disabled with red "Maintenance Blackout" badge; booking form restricts date selection.',
      actual: 'Vehicle displays green "Available" pill on booking calendar; contract completes with security deposit processed for an unavailable vehicle.',
      apiPayload: 'POST /api/fleet/rentals/book HTTP/1.1\n{ "vin": "ABC123DEF", "pickupDate": "2026-11-29", "deposit": 250 }\nStatus: 200 OK (FleetSyncService failed to propagate maintenance status to BookingCalendarAPI)'
    },
    // Fallback entries for legacy compatibility
    'hrms-bug-101': {
      id: 'BUG-DEL-101',
      severity: 'CRITICAL',
      severityClass: 'pill-critical',
      status: 'Status: VERIFIED & REPORTED',
      statusClass: 'st-fail',
      project: 'Delawala Group — Real Estate ERP',
      env: 'Chrome v122 / Windows 11 / Staging v3.1',
      module: 'Unit Allotment & Payment Gateway',
      title: 'Delawala ERP: Concurrency conflict allows simultaneous token payments for the same residential unit',
      description: 'During simultaneous booking requests from two sales managers for the same premium unit (Unit 302, Delawala Heights), the database lock fails to execute atomically, resulting in two confirmed reservation tokens generated for a single physical unit.',
      steps: [
        'Log in to Delawala Group ERP portal as Property Sales Executive.',
        'Navigate to <strong>Properties → Delawala Heights → Unit Matrix</strong>.',
        'Select available 3BHK unit: <code>Unit-302</code>.',
        'Simultaneously initiate token payment checkout from two separate sessions.',
        'Submit payment authorization on both sessions within 1.5 seconds.',
        'Observe booking status and generated allotment receipts.'
      ],
      expected: 'First transaction secures atomic row lock and marks unit as "Reserved"; second transaction rejects with: "Unit currently reserved by another representative".',
      actual: 'Both transactions succeed with 200 OK; database creates duplicate allotment IDs (ALT-4081 & ALT-4082) with overlapping lease agreements.',
      apiPayload: 'POST /api/v1/properties/units/302/reserve HTTP/1.1\n{ "agentId": "DEL-AG-04", "tokenAmount": 50000 }\nStatus: 200 OK (OptimisticLockException unhandled; duplicate token receipt generated)'
    },
    'web-bug-204': {
      id: 'BUG-ASP-201',
      severity: 'HIGH',
      severityClass: 'pill-critical',
      status: 'Status: VERIFIED & REPORTED',
      statusClass: 'st-fail',
      project: 'Aspino — Enterprise ERP System',
      env: 'Edge v121 / Ubuntu 22.04 / QA Environment',
      module: 'Manufacturing Batch & Multi-Warehouse Dispatch',
      title: 'Aspino ERP: Multi-warehouse transfer calculation omits scrap variance on bulk batch dispatch',
      description: 'When dispatching ceramic production batches from the primary manufacturing plant to Regional Warehouse B, the system fails to deduct quality inspection scrap percentage from total dispatched weight, resulting in an unresolvable inventory reconciliation discrepancy.',
      steps: [
        'Log in to Aspino Enterprise ERP with Warehouse Supervisor credentials.',
        'Navigate to <strong>Manufacturing → Batch Management → Dispatch Transfer</strong>.',
        'Select Production Batch <code>#TRK902 (Ceramic Floor Tiles - Grade A)</code>.',
        'Enter Dispatch Quantity: <code>1,000 Boxes</code> with <code>3.5% QC Scrap Margin</code>.',
        'Execute Goods Transfer Note (GTN) to Warehouse Regional Hub.',
        'Verify physical stock intake vs recorded ERP ledger balance.'
      ],
      expected: 'ERP computes net accepted stock (965 Boxes) and logs 35 Boxes to Scrap Loss account automatically.',
      actual: 'System logs transfer as 1,000 Boxes; receiving warehouse reports 35-unit ledger shortfall, locking automated invoice generation.',
      apiPayload: 'POST /api/v2/logistics/dispatch/transfer HTTP/1.1\n{ "batchId": "TRK902", "grossQty": 1000, "scrapRate": 0.035 }\nStatus: 200 OK (Accounting ledger variance: +35 units unallocated in StockLedgerService.ts:289)'
    }
  };

  const testCaseDetails = {
    'TC-DEL-015': {
      id: 'TC-DEL-015',
      title: 'Delawala ERP: Buyer KYC Document & Title Deed Verification',
      module: 'Delawala Real Estate ERP / Tenant & Buyer Onboarding',
      type: 'Functional & Compliance Validation',
      preconditions: 'Buyer allotment created with pending KYC state.',
      steps: [
        'Navigate to Delawala ERP → Buyer Management → KYC Verification.',
        'Attempt upload of 5MB scanned title deed PDF → verify compression and checksum match.',
        'Verify Aadhaar / PAN OCR extraction matches buyer registration fields.',
        'Approve verification workflow and confirm token payment status unlocks unit allocation.'
      ],
      result: 'PASSED (Zero compliance escape; automated OCR parsing and checksum verification enforced).'
    },
    'TC-ASP-015': {
      id: 'TC-ASP-015',
      title: 'Aspino ERP: Purchase Order Quantity Boundary & Vendor GST Calculation',
      module: 'Aspino Enterprise ERP / Procurement & SCM',
      type: 'Financial Logic & Boundary Test',
      preconditions: 'Registered vendor profile with active 18% GST slab.',
      steps: [
        'Create Purchase Order (PO) for 5,000 Raw Ceramic Glaze Bags.',
        'Verify subtotal, interstate IGST (18%), and prompt payment discount (2%).',
        'Verify boundary condition when ordering 0 or negative quantities throws: "Minimum order quantity is 1".',
        'Submit PO and verify automated Goods Receipt Note (GRN) draft generation.'
      ],
      result: 'PASSED (Precision currency rounding strictly verified across all line items).'
    },
    'TC-CAR-064': {
      id: 'TC-CAR-064',
      title: 'Cost Free Car ERP: Return Inspection Checklist Photo Upload & Fuel Log',
      module: 'Cost Free Car ERP / Vehicle Return & Audit',
      type: 'Mobile Web & Inspection Flow',
      preconditions: 'Rental agreement active in returned state at service depot.',
      steps: [
        'Open Cost Free Car Return Inspection flow on mobile tablet.',
        'Upload 4 mandatory vehicle angle photos (Front, Rear, Left, Right).',
        'Log return odometer reading (18,500 mi) and fuel tank level (75%).',
        'Verify automated fuel penalty calculation ($25) and security deposit refund balance ($225).'
      ],
      result: 'PASSED (Accurate delta calculation for odometer and automated deposit reconciliation).'
    },
    'TC-DEL-088': {
      id: 'TC-DEL-088',
      title: 'Delawala ERP: Lease Renewal Automated Notification & Escalation Trigger',
      module: 'Delawala Real Estate ERP / Lease Management',
      type: 'Notification & Scheduler Logic',
      preconditions: 'Commercial lease record with expiration date set to 30 days from current date.',
      steps: [
        'Execute automated daily cron scheduler for upcoming lease expirations.',
        'Verify tenant receives bilingual renewal notification via registered email & SMS.',
        'Verify updated lease escalation slab (+5% annual increment) accurately calculated.',
        'Confirm property manager dashboard flags tenant under "Pending Renewals".'
      ],
      result: 'PASSED (30-day early notification generated with valid escalated rental calculations).'
    },
    // Legacy mapping compatibility
    'TC-HR-015': {
      id: 'TC-DEL-015',
      title: 'Delawala ERP: Buyer KYC Document & Title Deed Verification',
      module: 'Delawala Real Estate ERP / Tenant & Buyer Onboarding',
      type: 'Functional & Compliance Validation',
      preconditions: 'Buyer allotment created with pending KYC state.',
      steps: [
        'Navigate to Delawala ERP → Buyer Management → KYC Verification.',
        'Upload scanned title deed PDF → verify compression and checksum match.',
        'Verify Aadhaar / PAN OCR extraction matches buyer registration fields.',
        'Approve verification workflow and confirm token payment status unlocks unit allocation.'
      ],
      result: 'PASSED (Zero compliance escape; automated OCR parsing and checksum verification enforced).'
    },
    'TC-WB-064': {
      id: 'TC-CAR-064',
      title: 'Cost Free Car ERP: Return Inspection Checklist Photo Upload & Fuel Log',
      module: 'Cost Free Car ERP / Vehicle Return & Audit',
      type: 'Mobile Web & Inspection Flow',
      preconditions: 'Rental agreement active in returned state at service depot.',
      steps: [
        'Open Cost Free Car Return Inspection flow on mobile tablet.',
        'Upload 4 mandatory vehicle angle photos (Front, Rear, Left, Right).',
        'Log return odometer reading (18,500 mi) and fuel tank level (75%).',
        'Verify automated fuel penalty calculation ($25) and security deposit refund balance ($225).'
      ],
      result: 'PASSED (Accurate delta calculation for odometer and automated deposit reconciliation).'
    },
    'TC-HR-088': {
      id: 'TC-DEL-088',
      title: 'Delawala ERP: Lease Renewal Automated Notification & Escalation Trigger',
      module: 'Delawala Real Estate ERP / Lease Management',
      type: 'Notification & Scheduler Logic',
      preconditions: 'Commercial lease record with expiration date set to 30 days from current date.',
      steps: [
        'Execute automated daily cron scheduler for upcoming lease expirations.',
        'Verify tenant receives bilingual renewal notification via registered email & SMS.',
        'Verify updated lease escalation slab (+5% annual increment) accurately calculated.',
        'Confirm property manager dashboard flags tenant under "Pending Renewals".'
      ],
      result: 'PASSED (30-day early notification generated with valid escalated rental calculations).'
    }
  };

  // ==========================================
  // 2. TOAST NOTIFICATION UTILITY
  // ==========================================
  const toastEl = document.getElementById('toast-notify');
  const toastMsg = document.getElementById('toast-msg');
  let toastTimer = null;

  function showToast(message, isError = false) {
    if (!toastEl || !toastMsg) return;
    toastMsg.textContent = message;
    
    if (isError) {
      toastEl.style.borderColor = 'rgba(239, 68, 68, 0.4)';
    } else {
      toastEl.style.borderColor = 'rgba(53, 99, 233, 0.4)';
    }

    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toastEl.classList.remove('show');
    }, 3500);
  }

  // ==========================================
  // 3. DEFECT VIEWER MODAL
  // ==========================================
  const bugModal = document.getElementById('bug-report-modal');
  const closeBugModalBtn = document.getElementById('close-bug-modal-btn');
  const closeModalBottomBtn = document.getElementById('close-modal-bottom-btn');

  function openBugReport(bugKey) {
    const data = bugDatabase[bugKey] || bugDatabase['hrms-bug-101'];
    if (!bugModal || !data) return;

    document.getElementById('modal-bug-severity').textContent = data.severity;
    document.getElementById('modal-bug-severity').className = `badge-pill ${data.severityClass}`;
    document.getElementById('modal-bug-id').textContent = data.id;
    document.getElementById('modal-bug-status').textContent = data.status;
    document.getElementById('modal-bug-title').textContent = data.title;
    document.getElementById('modal-bug-project').textContent = data.project;
    document.getElementById('modal-bug-env').textContent = data.env;
    document.getElementById('modal-bug-module').textContent = data.module;
    document.getElementById('modal-bug-desc').textContent = data.description;
    document.getElementById('modal-bug-expected').textContent = data.expected;
    document.getElementById('modal-bug-actual').textContent = data.actual;

    // Steps
    const stepsListEl = document.getElementById('modal-bug-steps');
    stepsListEl.innerHTML = '';
    data.steps.forEach(stepText => {
      const li = document.createElement('li');
      li.innerHTML = stepText;
      stepsListEl.appendChild(li);
    });

    bugModal.classList.add('active');
    bugModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeBugReport() {
    if (!bugModal) return;
    bugModal.classList.remove('active');
    bugModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  // Bind all buttons with class .open-bug-modal-btn
  document.querySelectorAll('.open-bug-modal-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const bugId = btn.getAttribute('data-bug-id');
      openBugReport(bugId);
    });
  });

  if (closeBugModalBtn) closeBugModalBtn.addEventListener('click', closeBugReport);
  if (closeModalBottomBtn) closeModalBottomBtn.addEventListener('click', closeBugReport);

  // Close on backdrop click
  if (bugModal) {
    bugModal.addEventListener('click', (e) => {
      if (e.target === bugModal) closeBugReport();
    });
  }

  // ==========================================
  // 4. TEST CASE MATRIX FILTERING & DETAILS
  // ==========================================
  const filterTabs = document.querySelectorAll('.filter-tab');
  const tableRows = document.querySelectorAll('#testcase-table-body tr');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const filter = tab.getAttribute('data-filter');
      tableRows.forEach(row => {
        const rowType = row.getAttribute('data-type');
        if (filter === 'all' || rowType === filter) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  });

  // Switch between Table View and Spreadsheet Artifacts View
  const btnViewTable = document.getElementById('btn-view-table');
  const btnViewSpreadsheet = document.getElementById('btn-view-spreadsheet');
  const viewTableContainer = document.getElementById('view-table-container');
  const viewSpreadsheetContainer = document.getElementById('view-spreadsheet-container');

  if (btnViewTable && btnViewSpreadsheet && viewTableContainer && viewSpreadsheetContainer) {
    btnViewTable.addEventListener('click', () => {
      btnViewTable.classList.add('active');
      btnViewSpreadsheet.classList.remove('active');
      viewTableContainer.style.display = '';
      viewSpreadsheetContainer.style.display = 'none';
    });

    btnViewSpreadsheet.addEventListener('click', () => {
      btnViewSpreadsheet.classList.add('active');
      btnViewTable.classList.remove('active');
      viewTableContainer.style.display = 'none';
      viewSpreadsheetContainer.style.display = 'grid';
    });
  }

  // Test Case Detail Modal
  const testCaseModal = document.getElementById('testcase-modal');
  const closeTestCaseModalBtn = document.getElementById('close-testcase-modal-btn');
  const closeTcModalBottomBtn = document.getElementById('close-tc-modal-bottom-btn');

  function openTestCaseDetails(tcId) {
    const tc = testCaseDetails[tcId];
    if (!testCaseModal || !tc) return;

    document.getElementById('modal-tc-id').textContent = tc.id;
    document.getElementById('modal-tc-title').textContent = tc.title;
    document.getElementById('modal-tc-module').textContent = tc.module;
    document.getElementById('modal-tc-type').textContent = tc.type;
    document.getElementById('modal-tc-preconditions').textContent = tc.preconditions;
    document.getElementById('modal-tc-result').textContent = tc.result;

    const stepsListEl = document.getElementById('modal-tc-steps');
    if (stepsListEl) {
      stepsListEl.innerHTML = '';
      tc.steps.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        stepsListEl.appendChild(li);
      });
    }

    testCaseModal.classList.add('active');
    testCaseModal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeTestCaseModal() {
    if (!testCaseModal) return;
    testCaseModal.classList.remove('active');
    testCaseModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.open-tc-detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tcId = btn.getAttribute('data-tc-id');
      openTestCaseDetails(tcId);
    });
  });

  if (closeTestCaseModalBtn) closeTestCaseModalBtn.addEventListener('click', closeTestCaseModal);
  if (closeTcModalBottomBtn) closeTcModalBottomBtn.addEventListener('click', closeTestCaseModal);
  if (testCaseModal) {
    testCaseModal.addEventListener('click', (e) => {
      if (e.target === testCaseModal) closeTestCaseModal();
    });
  }

  // Lightbox Preview for Spreadsheet Artifacts
  const lightboxModal = document.getElementById('artifact-lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxTitle = document.getElementById('lightbox-title');
  const lightboxBadge = document.getElementById('lightbox-badge');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const closeLightboxBtn = document.getElementById('close-lightbox-btn');
  const closeLightboxBottomBtn = document.getElementById('close-lightbox-bottom-btn');

  const artifactData = {
    'delawala': {
      title: 'Delawala Group — Real Estate ERP Unit Matrix & Floorplan',
      badge: 'Tested Project • Real Estate ERP',
      src: 'assets/delawala_realestate_erp.jpg?v=dark4',
      caption: 'Dark mode luxury real estate ERP portal tested across architectural floorplans, unit allotment grids (3BHK, Studio, Penthouses), KYC verification, and automated lease contracts.'
    },
    'aspino': {
      title: 'Aspino Enterprise ERP — Batch Transfer & Inspection Modal',
      badge: 'Tested Project • Manufacturing & SCM ERP',
      src: 'assets/aspino_enterprise_erp.jpg?v=dark4',
      caption: 'Dark mode enterprise ERP modal dialog tested for bulk ceramic batch transfers (#TRK-902), barcode scanning verification, scrap variance calculations, and automated defect logging.'
    },
    'car': {
      title: 'Cost Free Car — Automotive Fleet Hub & Inspection Checklist',
      badge: 'Tested Project • Automotive Management ERP',
      src: 'assets/cost_free_car_erp.jpg?v=dark4',
      caption: 'Dark mode automotive ERP interface tested across luxury vehicle grid availability, maintenance blackout status, reservation timeline calendars, and vehicle inspection checklists.'
    },
    'sheets': {
      title: 'Google Sheets Test Case & Outcome Matrix',
      badge: 'Real QA Deliverable • Execution Sheet',
      src: 'assets/Software Testing - Expected Outcome.jpeg',
      caption: 'Real Google Sheets test execution document detailing Module Name, Preconditions, Environment specs, Test Steps, Test Data, Expected vs. Actual Results, and Pass status.'
    },
    'smarthr': {
      title: 'Delawala Group Real Estate ERP Dashboard',
      badge: 'Tested Project • Real Estate ERP',
      src: 'assets/delawala_realestate_erp.jpg?v=dark4',
      caption: 'Full property portfolio dashboard tested across unit bookings, tenancy leasing contracts, and installment schedules.'
    },
    'ieee': {
      title: 'Enterprise QA Traceability Template',
      badge: 'Requirements Traceability Matrix (RTM)',
      src: 'assets/test_case_template.jpg',
      caption: 'End-to-end traceability linking business user stories, manual test IDs, severity matrix rankings, and staging build sign-offs.'
    }
  };

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      const type = el.getAttribute('data-lightbox');
      const item = artifactData[type] || artifactData['sheets'];
      if (!lightboxModal) return;
      if (lightboxTitle) lightboxTitle.textContent = item.title;
      if (lightboxBadge) lightboxBadge.textContent = item.badge;
      if (lightboxImg) {
        lightboxImg.src = item.src;
        lightboxImg.alt = item.title;
      }
      if (lightboxCaption) lightboxCaption.textContent = item.caption;
      lightboxModal.classList.add('active');
      lightboxModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  });

  function closeLightbox() {
    if (!lightboxModal) return;
    lightboxModal.classList.remove('active');
    lightboxModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closeLightboxBtn) closeLightboxBtn.addEventListener('click', closeLightbox);
  if (closeLightboxBottomBtn) closeLightboxBottomBtn.addEventListener('click', closeLightbox);
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) closeLightbox();
    });
  }

  // Button to scroll directly to testcase table
  document.querySelectorAll('.open-testcase-matrix-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector('.interactive-showcase-panel');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // ==========================================
  // 5. LIVE SMOKE TEST RUNNER SIMULATOR
  // ==========================================
  const runSmokeDemoBtn = document.getElementById('run-smoke-demo-btn');
  const terminalStream = document.getElementById('terminal-stream');

  if (runSmokeDemoBtn && terminalStream) {
    runSmokeDemoBtn.addEventListener('click', () => {
      runSmokeDemoBtn.disabled = true;
      runSmokeDemoBtn.innerHTML = `<span class="pulse-dot"></span><span>Running Live Test Suite...</span>`;

      terminalStream.innerHTML = `<div class="term-line"><span class="term-prefix">[RUNNER]</span> Initializing automated smoke pass execution...</div>`;

      const steps = [
        { delay: 600, text: `<span class="term-status pass">✓ PASS</span> TC-01: Healthcheck API Status 200 OK (52ms)` },
        { delay: 1200, text: `<span class="term-status pass">✓ PASS</span> TC-02: Boundary Input Validation (0, 100, 100000)` },
        { delay: 1800, text: `<span class="term-status pass">✓ PASS</span> TC-03: Viewport Responsive Breakpoints Check (Mobile/Desktop)` },
        { delay: 2400, text: `<span class="term-status pass">✓ PASS</span> TC-04: Role Permission Guard & Auth Tokens` },
        { delay: 3000, text: `<span class="term-status bug">⚡ DEFECT LOGGED</span> TC-05: Date Picker Overlap on Staging (Logged to Jira)` },
        { delay: 3600, text: `<div class="term-line" style="color: #3563E9; font-weight: bold;">[TEST RUN FINISHED] 4 Passed • 1 Defect Reported • Ready for Sprint Review</div>` }
      ];

      steps.forEach(step => {
        setTimeout(() => {
          const div = document.createElement('div');
          div.className = 'term-line';
          div.innerHTML = step.text;
          terminalStream.appendChild(div);
          terminalStream.scrollTop = terminalStream.scrollHeight;
        }, step.delay);
      });

      setTimeout(() => {
        runSmokeDemoBtn.disabled = false;
        runSmokeDemoBtn.innerHTML = `▶ RUN DEMO PASS`;
        showToast('Smoke Test Suite completed: Defect logged with reproduction steps.');
      }, 4000);
    });
  }

  const downloadResumeBtn = document.getElementById('btn-download-resume');
  if (downloadResumeBtn) {
    downloadResumeBtn.addEventListener('click', () => {
      showToast('Downloading Nandinee Soni QA Resume (PDF)...');
    });
  }

  // ==========================================
  // 6. PROFILE PERSONALIZER LOGIC (Default: Nandinee Soni)
  // ==========================================
  const openPersonalizerBtn = document.getElementById('open-personalizer-btn');
  const personalizerModal = document.getElementById('personalizer-modal');
  const closePersonalizerBtn = document.getElementById('close-personalizer-btn');
  const personalizerForm = document.getElementById('personalizer-form');
  const resetDefaultsBtn = document.getElementById('reset-defaults-btn');

  const defaultProfile = {
    name: 'Nandinee Soni',
    role: 'Manual QA Tester & QA Specialist',
    exp: '1–2 Years Practical Testing',
    audience: 'Both Freelance Clients & Employers',
    email: 'nandinee.soni.qa@gmail.com',
    linkedin: 'linkedin.com/in/nandinee-soni',
    heroDesc: 'I help businesses identify bugs, improve user experience, and ensure their websites and applications work as expected through detailed manual testing.'
  };

  function applyProfile(profile) {
    // Nav & Header (Logo: Nandinee Soni)
    const navName = document.getElementById('display-nav-name');
    if (navName) {
      const parts = (profile.name || '').trim().split(' ');
      if (parts.length > 1) {
        navName.textContent = parts[0];
        const primarySpan = navName.parentElement ? navName.parentElement.querySelector('.text-primary') : null;
        if (primarySpan) primarySpan.textContent = parts.slice(1).join(' ');
      } else {
        navName.textContent = profile.name;
        const primarySpan = navName.parentElement ? navName.parentElement.querySelector('.text-primary') : null;
        if (primarySpan) primarySpan.textContent = '';
      }
    }

    // Hero
    const heroName = document.getElementById('display-hero-name');
    if (heroName) heroName.textContent = profile.name;

    const heroNameHero = document.getElementById('display-hero-name-hero');
    if (heroNameHero) heroNameHero.textContent = profile.name;

    const heroRole = document.getElementById('display-hero-role');
    if (heroRole) heroRole.textContent = profile.role;

    const heroDesc = document.getElementById('display-hero-desc');
    if (heroDesc) heroDesc.textContent = profile.heroDesc;

    // About
    const expYears = document.getElementById('display-exp-years');
    if (expYears) expYears.textContent = profile.exp;

    // Contact
    const contactEmail = document.getElementById('display-contact-email');
    if (contactEmail) {
      contactEmail.textContent = profile.email;
      contactEmail.href = `mailto:${profile.email}`;
    }

    const contactLinkedin = document.getElementById('display-contact-linkedin');
    if (contactLinkedin) {
      contactLinkedin.textContent = profile.linkedin;
      contactLinkedin.href = profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`;
    }

    // Footer
    const footerLogoName = document.getElementById('display-footer-logo-name');
    if (footerLogoName) {
      const parts = (profile.name || '').trim().split(' ');
      if (parts.length > 1) {
        footerLogoName.textContent = parts[0];
        const primarySpan = footerLogoName.parentElement ? footerLogoName.parentElement.querySelector('.text-primary') : null;
        if (primarySpan) primarySpan.textContent = parts.slice(1).join(' ');
      } else {
        footerLogoName.textContent = profile.name;
        const primarySpan = footerLogoName.parentElement ? footerLogoName.parentElement.querySelector('.text-primary') : null;
        if (primarySpan) primarySpan.textContent = '';
      }
    }

    const copyrightName = document.getElementById('display-copyright-name');
    if (copyrightName) copyrightName.textContent = profile.name;

    // Availability badge
    const availBadge = document.getElementById('display-availability');
    if (availBadge) {
      if (profile.audience && profile.audience.includes('Freelance Only')) {
        availBadge.textContent = 'Available for Freelance Projects';
      } else if (profile.audience && profile.audience.includes('Employers Only')) {
        availBadge.textContent = 'Available for Full-Time QA Roles';
      } else {
        availBadge.textContent = 'Available for Opportunities';
      }
    }
  }

  function loadSavedProfile() {
    try {
      // Clear legacy saved profile if it had Alex Morgan or old spelling
      const saved = localStorage.getItem('qa_personal_profile');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (!parsed.name || parsed.name.toLowerCase().includes('alex') || parsed.name.toLowerCase().includes('morgan') || parsed.name === 'Nandini Soni') {
          localStorage.removeItem('qa_personal_profile');
          applyProfile(defaultProfile);
          return;
        }
        applyProfile(parsed);
        // Sync form inputs
        if (document.getElementById('p-name')) document.getElementById('p-name').value = parsed.name || defaultProfile.name;
        if (document.getElementById('p-role')) document.getElementById('p-role').value = parsed.role || defaultProfile.role;
        if (document.getElementById('p-exp')) document.getElementById('p-exp').value = parsed.exp || defaultProfile.exp;
        if (document.getElementById('p-audience')) document.getElementById('p-audience').value = parsed.audience || defaultProfile.audience;
        if (document.getElementById('p-email')) document.getElementById('p-email').value = parsed.email || defaultProfile.email;
        if (document.getElementById('p-linkedin')) document.getElementById('p-linkedin').value = parsed.linkedin || defaultProfile.linkedin;
        if (document.getElementById('p-hero-desc')) document.getElementById('p-hero-desc').value = parsed.heroDesc || defaultProfile.heroDesc;
      } else {
        applyProfile(defaultProfile);
      }
    } catch (e) {
      applyProfile(defaultProfile);
    }
  }

  if (openPersonalizerBtn && personalizerModal) {
    openPersonalizerBtn.addEventListener('click', () => {
      personalizerModal.classList.add('active');
      personalizerModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    });
  }

  function closePersonalizer() {
    if (!personalizerModal) return;
    personalizerModal.classList.remove('active');
    personalizerModal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (closePersonalizerBtn) closePersonalizerBtn.addEventListener('click', closePersonalizer);

  if (personalizerModal) {
    personalizerModal.addEventListener('click', (e) => {
      if (e.target === personalizerModal) closePersonalizer();
    });
  }

  if (personalizerForm) {
    personalizerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const updatedProfile = {
        name: document.getElementById('p-name').value.trim() || defaultProfile.name,
        role: document.getElementById('p-role').value.trim() || defaultProfile.role,
        exp: document.getElementById('p-exp').value,
        audience: document.getElementById('p-audience').value,
        email: document.getElementById('p-email').value.trim() || defaultProfile.email,
        linkedin: document.getElementById('p-linkedin').value.trim() || defaultProfile.linkedin,
        heroDesc: document.getElementById('p-hero-desc').value.trim() || defaultProfile.heroDesc
      };

      localStorage.setItem('qa_personal_profile', JSON.stringify(updatedProfile));
      applyProfile(updatedProfile);
      closePersonalizer();
      showToast('Profile personalized and updated across website!');
    });
  }

  if (resetDefaultsBtn) {
    resetDefaultsBtn.addEventListener('click', () => {
      localStorage.removeItem('qa_personal_profile');
      applyProfile(defaultProfile);
      if (document.getElementById('p-name')) document.getElementById('p-name').value = defaultProfile.name;
      if (document.getElementById('p-role')) document.getElementById('p-role').value = defaultProfile.role;
      if (document.getElementById('p-exp')) document.getElementById('p-exp').value = defaultProfile.exp;
      if (document.getElementById('p-audience')) document.getElementById('p-audience').value = defaultProfile.audience;
      if (document.getElementById('p-email')) document.getElementById('p-email').value = defaultProfile.email;
      if (document.getElementById('p-linkedin')) document.getElementById('p-linkedin').value = defaultProfile.linkedin;
      if (document.getElementById('p-hero-desc')) document.getElementById('p-hero-desc').value = defaultProfile.heroDesc;
      closePersonalizer();
      showToast('Reset to Nandinee Soni profile.');
    });
  }

  loadSavedProfile();

  // ==========================================
  // 7. CONTACT FORM SUBMISSION & COPY EMAIL
  // ==========================================
  const contactForm = document.getElementById('qa-contact-form');
  const submitBtn = document.getElementById('submit-form-btn');
  const formAlert = document.getElementById('form-alert');
  const copyEmailBtn = document.getElementById('copy-email-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!submitBtn) return;

      const originalBtnHtml = submitBtn.innerHTML;
      submitBtn.disabled = true;
      submitBtn.innerHTML = `<span>Transmitting Inquiry...</span>`;

      setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnHtml;

        if (formAlert) {
          formAlert.style.display = 'block';
          formAlert.className = 'form-status-alert success';
          formAlert.innerHTML = `<strong>Thank you!</strong> Your testing inquiry has been received. Nandinee will review your requirements and respond within 24 hours.`;
        }

        contactForm.reset();
        showToast('Inquiry sent successfully!');
      }, 1200);
    });
  }

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', () => {
      const emailEl = document.getElementById('display-contact-email');
      const email = emailEl ? emailEl.textContent.trim() : 'nandinee.soni.qa@gmail.com';
      navigator.clipboard.writeText(email).then(() => {
        showToast(`Email copied: ${email}`);
      }).catch(() => {
        showToast('Unable to copy email automatically');
      });
    });
  }

  // ==========================================
  // 8. MOBILE NAVIGATION, HEADER SCROLL & ESCAPE KEY LISTENER
  // ==========================================
  const mobileToggle = document.getElementById('mobile-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navBackdrop = document.getElementById('nav-backdrop');
  const siteHeader = document.getElementById('header');

  // Sticky header background blur effect on scroll (Ref: nehalkharadi.github.io)
  window.addEventListener('scroll', () => {
    if (window.scrollY > 20) {
      if (siteHeader) siteHeader.classList.add('scrolled');
    } else {
      if (siteHeader) siteHeader.classList.remove('scrolled');
    }
  });

  const closeMobileMenu = () => {
    if (mobileToggle) mobileToggle.classList.remove('active');
    if (navMenu) navMenu.classList.remove('open');
    if (navBackdrop) navBackdrop.classList.remove('active');
    document.body.classList.remove('nav-open');
  };

  const openMobileMenu = () => {
    if (mobileToggle) mobileToggle.classList.add('active');
    if (navMenu) navMenu.classList.add('open');
    if (navBackdrop) navBackdrop.classList.add('active');
    document.body.classList.add('nav-open');
  };

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      if (navMenu.classList.contains('open')) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    if (navBackdrop) {
      navBackdrop.addEventListener('click', closeMobileMenu);
    }

    document.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });

    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('open') && !navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
        closeMobileMenu();
      }
    });
  }

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeBugReport();
      closePersonalizer();
      closeTestCaseModal();
      closeLightbox();
    }
  });

  // Active navigation link highlighting on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 140;
      const sectionId = current.getAttribute('id');
      const navItem = document.querySelector(`.nav-links a[href*='${sectionId}']`) || document.querySelector(`.nav-menu a[href*='${sectionId}']`);

      if (navItem) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          navItem.classList.add('active');
        } else {
          navItem.classList.remove('active');
        }
      }
    });
  });

  // ==========================================
  // 9. SCROLL ENTRANCE REVEAL (IntersectionObserver)
  // ==========================================
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.05,
      rootMargin: '200px 0px 200px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // Instant trigger for elements already near viewport on load
    setTimeout(() => {
      revealElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 300) {
          el.classList.add('is-visible');
        }
      });
    }, 100);
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }

});
