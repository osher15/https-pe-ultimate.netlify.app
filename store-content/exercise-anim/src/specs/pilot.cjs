"use strict";
/* Pilot exercises (C10): squat, push-up, lunge, jumping jack, plank, glute bridge, Russian twist, burpee. */
module.exports = [
 {
  "id": "squat",
  "name": "Squat",
  "duration": 2.8,
  "camera": {
   "yaw": 0
  },
  "still": 1.3,
  "contacts": [
   {
    "eff": "toeR"
   },
   {
    "eff": "heelR"
   },
   {
    "eff": "toeL"
   },
   {
    "eff": "heelL"
   }
  ],
  "keys": [
   {
    "t": 0,
    "root": {
     "x": 0,
     "y": 89.85,
     "pitch": 0
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": 0,
    "arms": {
     "flex": 0,
     "abd": 6,
     "elbow": 12
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 1.2,
    "root": {
     "x": -21,
     "y": 44,
     "pitch": -38
    },
    "lumbar": 2,
    "thoracic": 2,
    "neck": -14,
    "arms": {
     "flex": 128,
     "abd": 6,
     "elbow": 6
    }
   },
   {
    "t": 1.45
   },
   {
    "t": 2.45,
    "same": 0
   },
   {
    "t": 2.8
   }
  ],
  "form": [
   "Feet about hip/shoulder width, whole foot planted — heels never lift",
   "Hips move back and down first; at the bottom the hip crease is at knee height (thigh about parallel)",
   "Knees travel forward over the toes, in line with the feet",
   "Chest up: trunk leans about 40° with a neutral spine; arms reach forward for balance, eyes forward",
   "Short pause at the bottom, drive up through the heels to full standing"
  ],
  "doubts": [
   "Side view cannot show knees caving in (valgus)."
  ]
 },
 {
  "id": "push",
  "name": "Push-up",
  "duration": 2.4,
  "camera": {
   "yaw": 0
  },
  "still": 1.05,
  "props": [
   {
    "type": "mat",
    "x": [
     -95,
     95
    ]
   }
  ],
  "contacts": [
   {
    "eff": "toeR"
   },
   {
    "eff": "toeL"
   },
   {
    "eff": "wristR"
   },
   {
    "eff": "wristL"
   }
  ],
  "keys": [
   {
    "t": 0,
    "root": {
     "pitch": -71.4
    },
    "rootFrom": {
     "eff": "toeR",
     "at": [
      -70,
      1.6
     ]
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": 0,
    "legs": {
     "flex": 0,
     "abd": 2,
     "knee": 0,
     "ankle": -12
    },
    "armR": {
     "ik": [
      54,
      6.2,
      19
     ]
    },
    "armL": {
     "ik": [
      54,
      6.2,
      -19
     ]
    }
   },
   {
    "t": 1,
    "root": {
     "pitch": -87.2
    }
   },
   {
    "t": 1.12
   },
   {
    "t": 2,
    "same": 0
   },
   {
    "t": 2.4
   }
  ],
  "form": [
   "Hands slightly wider than the shoulders, under the shoulders at the top",
   "Body one straight line from head to heels — it pivots rigidly on the toes, no sagging or piking hips",
   "Lower until the chest is close to the floor, elbows travelling back at about 45°",
   "Push back to straight arms, neck neutral"
  ],
  "doubts": []
 },
 {
  "id": "lunge",
  "name": "Lunge",
  "duration": 2.8,
  "camera": {
   "yaw": 0
  },
  "still": 1.12,
  "contacts": [
   {
    "eff": "toeL"
   },
   {
    "eff": "heelR",
    "from": 0.58,
    "to": 1.77
   },
   {
    "eff": "toeR",
    "from": 0.69,
    "to": 1.77
   }
  ],
  "keys": [
   {
    "t": 0,
    "root": {
     "x": 0,
     "y": 89.85,
     "pitch": 0
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": 0,
    "armR": {
     "rel": [
      1,
      3,
      22
     ]
    },
    "armL": {
     "rel": [
      1,
      3,
      -22
     ]
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 0.3,
    "ease": "inOut",
    "root": {
     "x": 20,
     "y": 85.5,
     "pitch": -3
    },
    "legR": {
     "foot": {
      "toe": [
       62,
       11
      ],
      "y": 9,
      "pitch": 12
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -14
     }
    }
   },
   {
    "t": 0.58,
    "ease": "out",
    "root": {
     "x": 41,
     "y": 72,
     "pitch": -4
    },
    "legR": {
     "foot": {
      "heel": [
       88,
       11
      ],
      "pitch": 14
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -38
     }
    }
   },
   {
    "t": 0.69,
    "ease": "linear",
    "root": {
     "x": 45,
     "y": 64,
     "pitch": -4
    },
    "legR": {
     "foot": {
      "heel": [
       88,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -48
     }
    }
   },
   {
    "t": 1.03,
    "ease": "out",
    "root": {
     "x": 51,
     "y": 52,
     "pitch": -3
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -60
     }
    }
   },
   {
    "t": 1.26
   },
   {
    "t": 1.77,
    "ease": "inOut",
    "root": {
     "x": 44,
     "y": 69,
     "pitch": -4
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -42
     }
    }
   },
   {
    "t": 2.1,
    "ease": "in",
    "root": {
     "x": 20,
     "y": 85.5,
     "pitch": -3
    },
    "legR": {
     "foot": {
      "toe": [
       62,
       11
      ],
      "y": 9,
      "pitch": 12
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -14
     }
    }
   },
   {
    "t": 2.43,
    "ease": "out",
    "same": 0
   },
   {
    "t": 2.8
   }
  ],
  "form": [
   "Hands on hips, trunk upright",
   "Big step forward, heel first, then the whole foot",
   "Lower straight down until both knees are about 90°: front shin near vertical, back knee just above the floor, back heel up",
   "Push through the front foot back to standing"
  ],
  "doubts": [
   "Forward lunge on one side only (right leg) per loop."
  ]
 },
 {
  "id": "jack",
  "name": "Jumping jack",
  "duration": 2.4,
  "cycles": 2,
  "camera": {
   "yaw": -72
  },
  "still": 0.55,
  "order": [
   "legL",
   "legR",
   "torso",
   "armL",
   "armR",
   "head"
  ],
  "contacts": [
   {
    "eff": "toeR",
    "from": 0,
    "to": 0.14
   },
   {
    "eff": "toeL",
    "from": 0,
    "to": 0.14
   },
   {
    "eff": "toeR",
    "from": 0.46,
    "to": 0.7
   },
   {
    "eff": "toeL",
    "from": 0.46,
    "to": 0.7
   },
   {
    "eff": "toeR",
    "from": 1.02,
    "to": 1.34
   },
   {
    "eff": "toeL",
    "from": 1.02,
    "to": 1.34
   }
  ],
  "keys": [
   {
    "t": 0,
    "root": {
     "x": 0,
     "y": 87.5,
     "pitch": 0
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": 0,
    "arms": {
     "flex": 4,
     "abd": 10,
     "elbow": 10
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 0.14,
    "ease": "inOut",
    "root": {
     "y": 89.8
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": -24
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -24
     }
    },
    "arms": {
     "abd": 40
    }
   },
   {
    "t": 0.3,
    "ease": "quadOut",
    "root": {
     "y": 95
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       22
      ],
      "y": 5,
      "pitch": -26
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -22
      ],
      "y": 5,
      "pitch": -26
     }
    },
    "arms": {
     "abd": 105,
     "elbow": 12
    }
   },
   {
    "t": 0.46,
    "ease": "quadIn",
    "root": {
     "y": 88.6
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       32
      ],
      "pitch": -16
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -32
      ],
      "pitch": -16
     }
    },
    "arms": {
     "abd": 160,
     "elbow": 14
    }
   },
   {
    "t": 0.56,
    "ease": "out",
    "root": {
     "y": 86.6
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       32
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -32
      ],
      "pitch": 0
     }
    },
    "arms": {
     "abd": 168,
     "elbow": 14
    }
   },
   {
    "t": 0.7,
    "ease": "inOut",
    "root": {
     "y": 88.6
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       32
      ],
      "pitch": -24
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -32
      ],
      "pitch": -24
     }
    },
    "arms": {
     "abd": 140
    }
   },
   {
    "t": 0.86,
    "ease": "quadOut",
    "root": {
     "y": 95
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       22
      ],
      "y": 5,
      "pitch": -26
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -22
      ],
      "y": 5,
      "pitch": -26
     }
    },
    "arms": {
     "abd": 75,
     "elbow": 12
    }
   },
   {
    "t": 1.02,
    "ease": "quadIn",
    "root": {
     "y": 89.6
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": -16
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -16
     }
    },
    "arms": {
     "abd": 18,
     "elbow": 10
    }
   },
   {
    "t": 1.2,
    "ease": "out",
    "same": 0
   }
  ],
  "form": [
   "From feet together, arms by the sides, jump the feet to about shoulder width while the arms sweep sideways overhead",
   "Hands almost meet overhead",
   "Land softly on the balls of the feet with soft knees, heels touch",
   "Jump back in while the arms come down; even rhythm"
  ],
  "doubts": [
   "The loop holds two identical repetitions; the GIF stores one."
  ]
 },
 {
  "id": "plank",
  "name": "Plank",
  "duration": 3,
  "camera": {
   "yaw": 0
  },
  "still": 0,
  "hold": true,
  "props": [
   {
    "type": "mat",
    "x": [
     -95,
     95
    ]
   }
  ],
  "contacts": [
   {
    "eff": "toeR"
   },
   {
    "eff": "toeL"
   },
   {
    "eff": "elbowR"
   },
   {
    "eff": "elbowL"
   },
   {
    "eff": "wristR"
   },
   {
    "eff": "wristL"
   }
  ],
  "keys": [
   {
    "t": 0,
    "ease": "sine",
    "root": {
     "pitch": -82.2
    },
    "rootFrom": {
     "eff": "toeR",
     "at": [
      -70,
      1.6
     ]
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": 0,
    "breath": 0,
    "legs": {
     "flex": 0,
     "abd": 2,
     "knee": 0,
     "ankle": -12
    },
    "arms": {
     "flex": 82.2,
     "abd": 2,
     "elbow": 88
    }
   },
   {
    "t": 1.3,
    "ease": "sine",
    "breath": 1
   },
   {
    "t": 3,
    "ease": "sine",
    "breath": 0
   }
  ],
  "form": [
   "Forearm plank: elbows directly under the shoulders, forearms forward on the floor, toes tucked",
   "Body one straight line, pelvis neither high nor low, eyes to the floor",
   "Hold and keep breathing (slight chest rise); the stopwatch means \"hold\""
  ],
  "doubts": []
 },
 {
  "id": "gluteb",
  "name": "Glute bridge",
  "duration": 2.8,
  "camera": {
   "yaw": 0
  },
  "still": 1.25,
  "props": [
   {
    "type": "mat",
    "x": [
     -80,
     95
    ]
   }
  ],
  "contacts": [
   {
    "eff": "shoulderR"
   },
   {
    "eff": "toeR"
   },
   {
    "eff": "heelR"
   },
   {
    "eff": "toeL"
   },
   {
    "eff": "heelL"
   },
   {
    "eff": "wristR"
   },
   {
    "eff": "wristL"
   }
  ],
  "keys": [
   {
    "t": 0,
    "root": {
     "pitch": 90
    },
    "rootFrom": {
     "eff": "shoulderR",
     "at": [
      -40,
      13.8
     ]
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": -10,
    "armR": {
     "ik": [
      8,
      6.2,
      24
     ]
    },
    "armL": {
     "ik": [
      8,
      6.2,
      -24
     ]
    },
    "legR": {
     "foot": {
      "toe": [
       63,
       11
      ],
      "y": 1.6,
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       63,
       -11
      ],
      "y": 1.6,
      "pitch": 0
     }
    }
   },
   {
    "t": 0.35
   },
   {
    "t": 1.2,
    "root": {
     "pitch": 117
    },
    "neck": 16
   },
   {
    "t": 1.7
   },
   {
    "t": 2.55,
    "same": 0
   },
   {
    "t": 2.8
   }
  ],
  "form": [
   "Lying on the back, knees bent, feet flat about hip width, arms on the floor beside the body",
   "Push through the heels and lift the hips until shoulders, hips and knees form a straight line (knee about 90°)",
   "No extra arch in the lower back — the lift comes from the hips",
   "Short squeeze at the top, lower with control; upper back, head, hands and feet stay down"
  ],
  "doubts": []
 },
 {
  "id": "rtwist",
  "name": "Russian twist",
  "duration": 2.8,
  "camera": {
   "yaw": -90,
   "elev": 32
  },
  "still": 0.7,
  "order": [
   "torso",
   "head",
   "legL",
   "legR",
   "armL",
   "armR"
  ],
  "props": [
   {
    "type": "mat",
    "x": [
     -70,
     85
    ],
    "z": [
     -40,
     40
    ]
   }
  ],
  "contacts": [
   {
    "eff": "toeR"
   },
   {
    "eff": "heelR"
   },
   {
    "eff": "toeL"
   },
   {
    "eff": "heelL"
   },
   {
    "eff": "pelvis"
   }
  ],
  "keys": [
   {
    "t": 0,
    "root": {
     "x": 0,
     "y": 12.5,
     "pitch": 40
    },
    "lumbar": 4,
    "thoracic": 0,
    "neck": 6,
    "twistL": 0,
    "twistT": 0,
    "headYaw": 0,
    "armR": {
     "ik": [
      10,
      40,
      2.5
     ]
    },
    "armL": {
     "ik": [
      10,
      40,
      -2.5
     ]
    },
    "legR": {
     "foot": {
      "toe": [
       58,
       11
      ],
      "y": 1.6,
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       58,
       -11
      ],
      "y": 1.6,
      "pitch": 0
     }
    }
   },
   {
    "t": 0.35,
    "ease": "quadIn",
    "twistL": -7,
    "twistT": -26,
    "headYaw": -10,
    "armR": {
     "ik": [
      6,
      26,
      26
     ]
    },
    "armL": {
     "ik": [
      6,
      26,
      21
     ]
    }
   },
   {
    "t": 0.7,
    "ease": "quadOut",
    "twistL": -12,
    "twistT": -36,
    "headYaw": -16,
    "armR": {
     "ik": [
      4,
      7.8,
      36
     ]
    },
    "armL": {
     "ik": [
      4,
      7.8,
      31
     ]
    }
   },
   {
    "t": 1.05,
    "ease": "quadIn",
    "twistL": -7,
    "twistT": -26,
    "headYaw": -10,
    "armR": {
     "ik": [
      6,
      26,
      26
     ]
    },
    "armL": {
     "ik": [
      6,
      26,
      21
     ]
    }
   },
   {
    "t": 1.4,
    "ease": "quadOut",
    "same": 0
   },
   {
    "t": 1.75,
    "ease": "quadIn",
    "twistL": 7,
    "twistT": 26,
    "headYaw": 10,
    "armR": {
     "ik": [
      6,
      26,
      -21
     ]
    },
    "armL": {
     "ik": [
      6,
      26,
      -26
     ]
    }
   },
   {
    "t": 2.1,
    "ease": "quadOut",
    "twistL": 12,
    "twistT": 36,
    "headYaw": 16,
    "armR": {
     "ik": [
      4,
      7.8,
      -31
     ]
    },
    "armL": {
     "ik": [
      4,
      7.8,
      -36
     ]
    }
   },
   {
    "t": 2.45,
    "ease": "quadIn",
    "twistL": 7,
    "twistT": 26,
    "headYaw": 10,
    "armR": {
     "ik": [
      6,
      26,
      -21
     ]
    },
    "armL": {
     "ik": [
      6,
      26,
      -26
     ]
    }
   },
   {
    "t": 2.8,
    "ease": "quadOut",
    "same": 0
   }
  ],
  "form": [
   "Seated on a mat, knees bent, heels on the floor (beginner version), trunk leaned back about 40°, back long and straight",
   "Hands together in front of the chest",
   "Rotate from the chest (the shoulders turn, the head follows), not only the arms",
   "Light touch on the floor beside the hip, through the centre to the other side"
  ],
  "doubts": [
   "Front elevated view so both side touches are visible; the backward lean is foreshortened in this view.",
   "Feet-up variant not shown."
  ]
 },
 {
  "id": "burpee",
  "name": "Burpee",
  "duration": 3,
  "maxStepCm": 35,
  "camera": {
   "yaw": 0
  },
  "still": 0.9,
  "contacts": [
   {
    "eff": "toeR",
    "from": 0,
    "to": 0.42
   },
   {
    "eff": "heelR",
    "from": 0,
    "to": 0.42
   },
   {
    "eff": "wristR",
    "from": 0.42,
    "to": 1.44
   },
   {
    "eff": "wristL",
    "from": 0.42,
    "to": 1.44
   },
   {
    "eff": "toeR",
    "from": 0.84,
    "to": 1.02
   },
   {
    "eff": "toeL",
    "from": 0.84,
    "to": 1.02
   },
   {
    "eff": "toeR",
    "from": 1.44,
    "to": 1.92
   },
   {
    "eff": "heelR",
    "from": 1.44,
    "to": 1.72
   },
   {
    "eff": "toeR",
    "from": 2.52,
    "to": 3
   },
   {
    "eff": "heelR",
    "from": 2.52,
    "to": 3
   }
  ],
  "keys": [
   {
    "t": 0,
    "root": {
     "x": 0,
     "y": 89.85,
     "pitch": 0
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": 0,
    "armR": {
     "ik": null,
     "flex": 0,
     "abd": 6,
     "elbow": 12
    },
    "armL": {
     "ik": null,
     "flex": 0,
     "abd": 6,
     "elbow": 12
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 0.42,
    "ease": "sine",
    "root": {
     "x": -22,
     "y": 42,
     "pitch": -64
    },
    "lumbar": 10,
    "thoracic": 10,
    "neck": -25,
    "armR": {
     "ik": [
      35,
      4.6,
      17
     ],
     "flex": 85,
     "abd": 2,
     "elbow": 40
    },
    "armL": {
     "ik": [
      35,
      4.6,
      -17
     ],
     "flex": 85,
     "abd": 2,
     "elbow": 40
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 0.58,
    "ease": "sine",
    "root": {
     "x": -6,
     "y": 59,
     "pitch": -98
    },
    "lumbar": 6,
    "thoracic": 6,
    "neck": -18,
    "legR": {
     "foot": {
      "toe": [
       -8,
       11
      ],
      "pitch": -30,
      "y": 18,
      "loose": true,
      "ankle": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       -8,
       -11
      ],
      "pitch": -30,
      "y": 18,
      "loose": true,
      "ankle": 0
     }
    }
   },
   {
    "t": 0.7,
    "ease": "linear",
    "root": {
     "x": -4,
     "y": 58,
     "pitch": -94
    },
    "lumbar": 2,
    "thoracic": 2,
    "neck": -10,
    "legR": {
     "foot": {
      "toe": [
       -50,
       11
      ],
      "pitch": -60,
      "y": 30,
      "loose": true,
      "ankle": -15
     }
    },
    "legL": {
     "foot": {
      "toe": [
       -50,
       -11
      ],
      "pitch": -60,
      "y": 30,
      "loose": true,
      "ankle": -15
     }
    }
   },
   {
    "t": 0.84,
    "ease": "out",
    "root": {
     "x": -0.8,
     "y": 43.9,
     "pitch": -71.5
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": -5,
    "legR": {
     "foot": {
      "toe": [
       -86,
       11
      ],
      "pitch": -83.5
     }
    },
    "legL": {
     "foot": {
      "toe": [
       -86,
       -11
      ],
      "pitch": -83.5
     }
    }
   },
   {
    "t": 1.02
   },
   {
    "t": 1.16,
    "ease": "sine",
    "root": {
     "x": -4,
     "y": 58,
     "pitch": -94
    },
    "lumbar": 2,
    "thoracic": 2,
    "neck": -10,
    "legR": {
     "foot": {
      "toe": [
       -50,
       11
      ],
      "pitch": -60,
      "y": 30,
      "loose": true,
      "ankle": -15
     }
    },
    "legL": {
     "foot": {
      "toe": [
       -50,
       -11
      ],
      "pitch": -60,
      "y": 30,
      "loose": true,
      "ankle": -15
     }
    }
   },
   {
    "t": 1.28,
    "ease": "sine",
    "root": {
     "x": -6,
     "y": 59,
     "pitch": -98
    },
    "lumbar": 6,
    "thoracic": 6,
    "neck": -18,
    "legR": {
     "foot": {
      "toe": [
       -8,
       11
      ],
      "pitch": -30,
      "y": 18,
      "loose": true,
      "ankle": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       -8,
       -11
      ],
      "pitch": -30,
      "y": 18,
      "loose": true,
      "ankle": 0
     }
    }
   },
   {
    "t": 1.44,
    "ease": "sine",
    "root": {
     "x": -22,
     "y": 42,
     "pitch": -64
    },
    "lumbar": 10,
    "thoracic": 10,
    "neck": -25,
    "armR": {
     "ik": [
      35,
      4.6,
      17
     ],
     "flex": 85,
     "abd": 2,
     "elbow": 40
    },
    "armL": {
     "ik": [
      35,
      4.6,
      -17
     ],
     "flex": 85,
     "abd": 2,
     "elbow": 40
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 1.72,
    "ease": "sine",
    "root": {
     "x": -10,
     "y": 66,
     "pitch": -36
    },
    "lumbar": 4,
    "thoracic": 4,
    "neck": -10,
    "armR": {
     "ik": null,
     "flex": 125,
     "abd": 6,
     "elbow": 15
    },
    "armL": {
     "ik": null,
     "flex": 125,
     "abd": 6,
     "elbow": 15
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 1.92,
    "ease": "sine",
    "root": {
     "x": 0,
     "y": 98.5,
     "pitch": 0
    },
    "lumbar": 0,
    "thoracic": 0,
    "neck": 0,
    "armR": {
     "ik": null,
     "flex": 150,
     "abd": 6,
     "elbow": 10
    },
    "armL": {
     "ik": null,
     "flex": 150,
     "abd": 6,
     "elbow": 10
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": -40
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -40
     }
    }
   },
   {
    "t": 2.12,
    "ease": "quadOut",
    "root": {
     "x": 0,
     "y": 108,
     "pitch": 0
    },
    "armR": {
     "ik": null,
     "flex": 175,
     "abd": 6,
     "elbow": 5
    },
    "armL": {
     "ik": null,
     "flex": 175,
     "abd": 6,
     "elbow": 5
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": -35,
      "y": 11
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -35,
      "y": 11
     }
    }
   },
   {
    "t": 2.32,
    "ease": "quadIn",
    "root": {
     "x": 0,
     "y": 93,
     "pitch": 0
    },
    "armR": {
     "ik": null,
     "flex": 95,
     "abd": 6,
     "elbow": 12
    },
    "armL": {
     "ik": null,
     "flex": 95,
     "abd": 6,
     "elbow": 12
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": -22
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": -22
     }
    }
   },
   {
    "t": 2.52,
    "ease": "sine",
    "root": {
     "x": -8,
     "y": 80,
     "pitch": -12
    },
    "lumbar": 2,
    "thoracic": 2,
    "armR": {
     "ik": null,
     "flex": 30,
     "abd": 6,
     "elbow": 15
    },
    "armL": {
     "ik": null,
     "flex": 30,
     "abd": 6,
     "elbow": 15
    },
    "legR": {
     "foot": {
      "toe": [
       14,
       11
      ],
      "pitch": 0
     }
    },
    "legL": {
     "foot": {
      "toe": [
       14,
       -11
      ],
      "pitch": 0
     }
    }
   },
   {
    "t": 3,
    "ease": "inOut",
    "same": 0
   }
  ],
  "form": [
   "Squat and place the hands on the floor in front of the feet",
   "Jump the feet back (hips briefly high) to a straight-arm plank with a straight body",
   "Jump the feet back in to the squat",
   "Stand up and jump with the arms overhead, land softly with bent knees"
  ],
  "doubts": [
   "No push-up in this version.",
   "The jump arm swing is the fastest motion in the library (~8 m/s at the hand)."
  ]
 }
];
