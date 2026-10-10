// services/aiService.js - Modular AI Complaint Analysis Service
// Supports AI API integration (e.g. Gemini / OpenAI / Custom AI REST endpoint) via AI_API_KEY environment variable.
// Provides standard rule-based fallback logic when key is missing or API is unreachable.

const analyzeComplaint = async (description) => {
  const apiKey = process.env.AI_API_KEY;
  const desc = (description || '').trim();

  // If AI_API_KEY is configured, attempt real AI API call
  if (apiKey && apiKey !== 'your_ai_key_here') {
    try {
      // Example call to Gemini REST API (or OpenAI REST API)
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an AI complaint triage assistant for institutional facility management.
Analyze the following maintenance complaint description and return ONLY a JSON object (no markdown, no extra text) with these fields:
- category: one of ["Electrical", "Plumbing", "IT Equipment", "Network", "AC & Cooling", "Cleaning", "Furniture", "Security", "Other"]
- priority: one of ["Low", "Medium", "High", "Critical"]
- department: string (e.g. "Electrical Maintenance", "Plumbing Support", "IT Helpdesk", "Housekeeping", "Facility Management")
- suggestedAction: brief practical action step for technicians
- confidence: number between 0.70 and 0.99

Complaint Description: "${desc}"`
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanedText);

          return {
            category: parsed.category || 'Other',
            priority: parsed.priority || 'Medium',
            department: parsed.department || 'Maintenance',
            suggestedAction: parsed.suggestedAction || 'Inspect complaint location and assess damage.',
            confidence: parsed.confidence || 0.92,
            isDemo: false
          };
        }
      }
    } catch (error) {
      console.warn('[AI Service Warning]: AI API call failed. Falling back to local AI rules engine:', error.message);
    }
  }

  // Fallback Rule-Based AI Engine (Demo Mode)
  return getFallbackAnalysis(desc);
};

// Intelligent Rule-Based Fallback Engine
const getFallbackAnalysis = (desc) => {
  const text = desc.toLowerCase();

  // 1. AC & Cooling
  if (text.includes('ac') || text.includes('cooling') || text.includes('air conditioner') || text.includes('chiller') || text.includes('fan coil')) {
    return {
      category: 'AC & Cooling',
      priority: 'High',
      department: 'Maintenance',
      suggestedAction: 'Inspect AC compressor, clean air filters, and check coolant/refrigerant levels.',
      confidence: 0.94,
      isDemo: true
    };
  }

  // 2. IT Equipment & Projector
  if (text.includes('projector') || text.includes('computer') || text.includes('pc') || text.includes('monitor') || text.includes('printer') || text.includes('mouse') || text.includes('keyboard') || text.includes('screen')) {
    return {
      category: 'IT Equipment',
      priority: 'High',
      department: 'IT Support',
      suggestedAction: 'Inspect HDMI/VGA display cables, test power supply unit, and check device drivers.',
      confidence: 0.91,
      isDemo: true
    };
  }

  // 3. Wi-Fi / Network
  if (text.includes('wifi') || text.includes('wi-fi') || text.includes('internet') || text.includes('network') || text.includes('router') || text.includes('lan') || text.includes('connection')) {
    return {
      category: 'Network',
      priority: 'Medium',
      department: 'IT Support',
      suggestedAction: 'Reset access point router, verify IP DHCP gateway configuration, and check bandwidth load.',
      confidence: 0.89,
      isDemo: true
    };
  }

  // 4. Water Leakage & Plumbing
  if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('tap') || text.includes('toilet') || text.includes('flush') || text.includes('sink') || text.includes('drain')) {
    return {
      category: 'Plumbing',
      priority: 'High',
      department: 'Plumbing',
      suggestedAction: 'Isolate main water valve line, inspect pipe fittings, and replace damaged rubber gaskets.',
      confidence: 0.95,
      isDemo: true
    };
  }

  // 5. Electrical & Fan
  if (text.includes('fan') || text.includes('electric') || text.includes('power') || text.includes('switch') || text.includes('light') || text.includes('socket') || text.includes('wire') || text.includes('spark') || text.includes('mcb')) {
    return {
      category: 'Electrical',
      priority: text.includes('spark') || text.includes('fire') ? 'Critical' : 'Medium',
      department: 'Electrical Maintenance',
      suggestedAction: 'Check circuit breaker trip switch, test socket voltage, and replace faulty wiring/capacitor.',
      confidence: 0.93,
      isDemo: true
    };
  }

  // 6. Cleaning & Sanitation
  if (text.includes('clean') || text.includes('dust') || text.includes('trash') || text.includes('garbage') || text.includes('stain') || text.includes('spill') || text.includes('washroom') || text.includes('dirty')) {
    return {
      category: 'Cleaning',
      priority: 'Medium',
      department: 'Housekeeping',
      suggestedAction: 'Deploy housekeeping team for floor sanitization, trash clearance, and surface cleaning.',
      confidence: 0.88,
      isDemo: true
    };
  }

  // 7. Furniture & Carpentry
  if (text.includes('chair') || text.includes('table') || text.includes('desk') || text.includes('bench') || text.includes('door') || text.includes('lock') || text.includes('window') || text.includes('furniture')) {
    return {
      category: 'Furniture',
      priority: 'Low',
      department: 'Carpentry',
      suggestedAction: 'Inspect structural hinges, tighten loose screws/joints, or schedule woodwork replacement.',
      confidence: 0.87,
      isDemo: true
    };
  }

  // Default fallback
  return {
    category: 'Other',
    priority: 'Medium',
    department: 'Maintenance',
    suggestedAction: 'Conduct on-site inspection by general maintenance staff to evaluate issue specifics.',
    confidence: 0.75,
    isDemo: true
  };
};

// Chatbot Assistant Service
const chatAssistant = async (message, userContext = {}) => {
  const apiKey = process.env.AI_API_KEY;
  const msg = (message || '').trim();

  if (apiKey && apiKey !== 'your_ai_key_here') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are "FixIt Bot", an AI maintenance support assistant for an institutional campus management system (FixIt AI).
Help the user with maintenance queries, complaint filing assistance, troubleshooting advice, or status explanations.
Keep your response concise, polite, helpful, and formatted nicely with bullet points if applicable.

User Role: ${userContext.role || 'user'}
User Message: "${msg}"`
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { reply: text, isDemo: false };
        }
      }
    } catch (err) {
      console.warn('[AI Chatbot Warning]: Gemini API call failed, using fallback chatbot:', err.message);
    }
  }

  // Smart Fallback Chatbot Logic
  return getFallbackChatReply(msg);
};

const getFallbackChatReply = (msg) => {
  const text = msg.toLowerCase();

  if (text.includes('hello') || text.includes('hi') || text.includes('hey')) {
    return {
      reply: 'Hello! 👋 I am FixIt Bot, your AI maintenance assistant. How can I help you today? You can ask me how to report a problem, check complaint status, or troubleshoot equipment!',
      isDemo: true,
    };
  }

  if (text.includes('ac') || text.includes('cooling') || text.includes('air conditioner')) {
    return {
      reply: '🧊 **AC Troubleshooting & Support:**\n- Ensure the main power switch is turned ON.\n- Check if the remote thermostat temperature is set below 22°C.\n- If it is leaking water or blowing warm air, click **"Report Problem"** in the sidebar and use our AI triage to request a technician!',
      isDemo: true,
    };
  }

  if (text.includes('wifi') || text.includes('internet') || text.includes('network')) {
    return {
      reply: '🌐 **Network & Wi-Fi Support:**\n- Try toggling Wi-Fi off and on on your device.\n- If an entire classroom router is down, file a complaint under **Network** category so IT Support can reset the access point.',
      isDemo: true,
    };
  }

  if (text.includes('water') || text.includes('leak') || text.includes('plumbing')) {
    return {
      reply: '💧 **Plumbing Emergency:**\n- If there is an urgent water leak, turn off the nearest tap valve if accessible.\n- Submit a complaint with **High** priority under **Plumbing** so campus plumbers get notified immediately!',
      isDemo: true,
    };
  }

  if (text.includes('status') || text.includes('track') || text.includes('my complaint')) {
    return {
      reply: '📋 **Tracking Complaints:**\n- Click on **"My Complaints"** in the left sidebar to view all your reported tickets.\n- You can see real-time status updates (`Pending`, `Assigned`, `In Progress`, `Resolved`) and technician notes!',
      isDemo: true,
    };
  }

  if (text.includes('contact') || text.includes('helpdesk') || text.includes('phone') || text.includes('email')) {
    return {
      reply: '📞 **Helpdesk Contact Info:**\n- **Email**: bhumi@gmail.com\n- **Phone**: +91 8733456287\n- **Location**: Surat Facility Dept.',
      isDemo: true,
    };
  }

  return {
    reply: '🤖 I am here to help with campus maintenance! You can ask me about AC issues, plumbing leaks, Wi-Fi problems, tracking your tickets, or how to report a new problem.',
    isDemo: true,
  };
};

// AI Solution & Repair Guide Generator Service for Staff & Admin
const generateSolutionGuide = async (complaintData) => {
  const apiKey = process.env.AI_API_KEY;
  const title = complaintData.title || '';
  const desc = complaintData.description || '';
  const category = complaintData.category || '';
  const location = complaintData.location || '';

  if (apiKey && apiKey !== 'your_ai_key_here') {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert Facility Engineering Advisor and Technician Repair Assistant.
Provide a step-by-step diagnostic and repair guide for the following reported issue:

Title: "${title}"
Category: "${category}"
Description: "${desc}"
Location: "${location}"

Return ONLY a valid JSON object (no markdown formatting, no extra code fences) with these fields:
- diagnosticSteps: array of strings (3 to 5 inspection/checking steps for technicians)
- recommendedFix: array of strings (3 to 5 repair/resolution steps)
- requiredTools: array of strings (tools/materials needed, e.g. Multimeter, Wrench, Refrigerant, Cat6 Cable)
- safetyWarning: string (important safety precaution)`
                  }
                ]
              }
            ]
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanedText = rawText.replace(/```json|```/g, '').trim();
          const parsed = JSON.parse(cleanedText);
          return {
            diagnosticSteps: parsed.diagnosticSteps || [],
            recommendedFix: parsed.recommendedFix || [],
            requiredTools: parsed.requiredTools || [],
            safetyWarning: parsed.safetyWarning || '',
            isDemo: false,
          };
        }
      }
    } catch (err) {
      console.warn('[AI Solution Guide Warning]: Gemini call failed, using fallback:', err.message);
    }
  }

  // Fallback Rule-Based Repair Guide Engine
  return getFallbackSolutionGuide(title + ' ' + desc + ' ' + category);
};

const getFallbackSolutionGuide = (textInput) => {
  const text = textInput.toLowerCase();

  // 1. AC & Cooling
  if (text.includes('ac') || text.includes('cooling') || text.includes('air conditioner')) {
    return {
      diagnosticSteps: [
        'Check main circuit breaker panel to verify power input voltage.',
        'Inspect air filter mesh for dust clogging and restricted airflow.',
        'Check outdoor compressor fan motor rotation and capacitor reading.',
        'Inspect drain pipe line for water leakage or algae blockage.',
      ],
      recommendedFix: [
        'Clean air filter mesh thoroughly with pressurized water.',
        'Clear drain line blockage using air pressure suction.',
        'Measure refrigerant pressure (PSI) and top up R410A gas if low.',
        'Replace faulty dual-run capacitor (35+5 uF) if compressor hums.',
      ],
      requiredTools: ['Multimeter', 'Manifold Gauge Set', 'R410A Gas Canister', 'Screwdriver Set', 'Cleaning Pump'],
      safetyWarning: 'Ensure main circuit breaker is OFF before opening electrical terminal covers.',
      isDemo: true,
    };
  }

  // 2. Plumbing & Leakage
  if (text.includes('water') || text.includes('leak') || text.includes('pipe') || text.includes('tap') || text.includes('plumbing')) {
    return {
      diagnosticSteps: [
        'Locate the main isolation control valve for the affected room/floor.',
        'Inspect pipe joints, compression fittings, and tap O-ring seals.',
        'Check for hairline cracks in PVC/CPVC pipes or tap spindle threads.',
      ],
      recommendedFix: [
        'Shut off main water valve line completely.',
        'Remove damaged tap spindle or coupling joint.',
        'Apply Teflon thread seal tape and replace rubber O-ring seal.',
        'Tighten compression fitting securely and test water flow pressure.',
      ],
      requiredTools: ['Adjustable Pipe Wrench', 'Teflon Tape', 'Rubber O-Rings', 'Pipe Thread Sealant'],
      safetyWarning: 'Wipe wet floor marble dry to prevent slip hazards during inspection.',
      isDemo: true,
    };
  }

  // 3. Electrical & Power
  if (text.includes('fan') || text.includes('electric') || text.includes('power') || text.includes('switch') || text.includes('light') || text.includes('spark')) {
    return {
      diagnosticSteps: [
        'Test wall socket voltage output using digital multimeter (expected 230V AC).',
        'Inspect MCB circuit breaker switch for trip indicator position.',
        'Check switchboard internal wiring connection for loose terminal screws.',
      ],
      recommendedFix: [
        'Turn off main sub-station distribution board switch.',
        'Replace burned 16A/32A MCB switch with identical rating.',
        'Strip burned wire ends, crimp new lugs, and tighten terminal screws.',
        'Turn power back on and test load current draw using clamp meter.',
      ],
      requiredTools: ['Digital Multimeter', 'Insulated Screwdrivers', 'Wire Stripper', 'Clamp Meter', 'Replacement MCB'],
      safetyWarning: 'DANGER: Always use insulated rubber gloves and test wire voltage before touching live terminals.',
      isDemo: true,
    };
  }

  // 4. IT & Network / Projector
  if (text.includes('projector') || text.includes('wifi') || text.includes('computer') || text.includes('network') || text.includes('router') || text.includes('pc')) {
    return {
      diagnosticSteps: [
        'Inspect HDMI/VGA cable connection between source PC and display unit.',
        'Check RJ-45 LAN Ethernet cable link status lights on router/switch.',
        'Verify IP DHCP configuration and gateway ping latency.',
      ],
      recommendedFix: [
        'Power cycle the access point router or network switch (unplug for 30s).',
        'Replace damaged HDMI / LAN patch cable with tested Cat6 cable.',
        'Recalibrate display resolution and update display adapter drivers.',
      ],
      requiredTools: ['Network Cable Tester', 'RJ45 Crimping Tool', 'Spare Cat6 Cables', 'Spare HDMI Cable'],
      safetyWarning: 'Avoid looking directly into the high-intensity projector lamp beam during operation.',
      isDemo: true,
    };
  }

  // General Fallback
  return {
    diagnosticSteps: [
      'Perform physical inspection of reported item at location.',
      'Check structural integrity, mounting screws, and operational switches.',
      'Verify whether issue requires specialist component replacement.',
    ],
    recommendedFix: [
      'Clean equipment housing and tighten loose mechanical fasteners.',
      'Replace defective sub-assembly component if necessary.',
      'Conduct final functional test and log resolution notes in system.',
    ],
    requiredTools: ['Standard Tool Kit', 'Screwdriver Set', 'Cleaning Cloth'],
    safetyWarning: 'Follow standard campus safety protocols while working on site.',
    isDemo: true,
  };
};

module.exports = {
  analyzeComplaint,
  chatAssistant,
  generateSolutionGuide,
};
