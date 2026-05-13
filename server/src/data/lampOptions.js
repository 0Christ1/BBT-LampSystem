export const lampOptions = [
  {
    id: "peace",
    label: "平安光明灯",
    shortLabel: "平安灯",
    description:
      "为个人或阖家祈愿身心安稳、出入平安、福慧增长，适合全年供灯祈福。",
    plans: [
      {
        id: "personal",
        label: "个人",
        code: "PP",
        amount: 88,
        duration: "1年"
      },
      {
        id: "family",
        label: "阖家",
        code: "PF",
        amount: 188,
        duration: "1年"
      }
    ]
  },
  {
    id: "wealth",
    label: "财富光明灯",
    shortLabel: "财富灯",
    description:
      "为事业、公司、财富资粮与善缘增长祈福，适合功德主、公司或个人供灯。",
    plans: [
      {
        id: "great-patron",
        label: "大功德主",
        code: "WG",
        amount: 888,
        duration: "3年"
      },
      {
        id: "company",
        label: "公司",
        code: "WC",
        amount: 188,
        duration: "1年"
      },
      {
        id: "personal",
        label: "个人",
        code: "WP",
        amount: 88,
        duration: "1年"
      }
    ]
  }
];

export const findLampSelection = (lampType, planId) => {
  const lamp = lampOptions.find((option) => option.id === lampType);
  const plan = lamp?.plans.find((item) => item.id === planId);

  if (!lamp || !plan) {
    return null;
  }

  return { lamp, plan };
};
