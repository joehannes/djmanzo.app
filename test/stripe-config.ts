/** What Stripe's dashboard has on: each way to pay as its payment method configuration says it. */
export function stripeConfig(on: string[], off: string[] = []) {
  const m = (v: "on" | "off") => ({ available: true, display_preference: { overridable: true, preference: v, value: v } });
  return { id: "pmc_1", object: "payment_method_configuration", active: true, is_default: true, parent: null, name: "Default", ...Object.fromEntries([...on.map((k) => [k, m("on")]), ...off.map((k) => [k, m("off")])]) };
}
