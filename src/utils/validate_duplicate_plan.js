// Helper function to validate duplicate plans
export const validateDuplicatePlans = (plans, existingPlans = []) => {
  if (!plans || plans.length === 0) return null;

  const planSet = new Set();
  
  for (const plan of plans) {
    // Use fields that define uniqueness
    const key = `${plan.plan_type}-${plan.duration_days}`;

    if (planSet.has(key)) {
      return `Duplicate plan found: Plan Type "${plan.plan_type}" with Duration ${plan.duration_days} days already exists.`;
    }
    planSet.add(key);
  }

  // Check against existing plans (for update operations)
  if (existingPlans.length > 0) {
    for (const plan of plans) {
      if (!plan.id) { // Only check new plans, not existing ones being updated
        const key = `${plan.plan_type}-${plan.duration_days}`;
        const existingPlan = existingPlans.find(p => 
          `${p.plan_type}-${p.duration_days}` === key
        );
        if (existingPlan) {
          return `Duplicate plan found: Plan Type "${plan.plan_type}" with Duration ${plan.duration_days} days already exists in the package.`;
        }
      }
    }
  }

  return null;
};