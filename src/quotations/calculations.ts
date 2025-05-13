// Calculations for ejaar simulator

export function calculateResidualValue(totalAmount: number, residualValuePercentage: number): number {
    return (totalAmount * residualValuePercentage) / 100;
}

export function calculateMonthlyRate(annualRate: number): number {
    return Math.pow(1 + annualRate / 100, 1/12) - 1;
}

export function calculateEjaarFinancingRateAnnual(leaserRate: number, spreadRate: number): number {
    return leaserRate + spreadRate;
}

export function calculateMonthlyPayment(
    totalAmount: number,
    residualValue: number,
    monthlyRate: number,
    durationMonths: number
): number {
    // Convert monthly rate from percentage to decimal
    const rate = monthlyRate / 100;

    // Formula: (totalAmount - residualValue * (1 + rate)^(-duration)) * (rate / (1 - (1 + rate)^(-duration)))
    const discountedResidualValue = residualValue * Math.pow(1 + rate, -durationMonths);
    const amountToFinance = totalAmount - discountedResidualValue;
    const annuityFactor = rate / (1 - Math.pow(1 + rate, -durationMonths));

    return amountToFinance * annuityFactor;
}

export function calculateTotalPayment(monthlyPayment: number, durationMonths: number): number {
    return monthlyPayment * durationMonths;
}

export function performCalculations(
    totalAmount: number,
    durationMonths: number,
    residualValuePercentage: number,
    financingSpreadAnnual: number,
    leaserFinancingRateAnnual: number,
    fileFeesPercentage: number = 0,
) {
    // Calculate residual value
    const residualValue = calculateResidualValue(totalAmount, residualValuePercentage);

    // Calculate Leaser monthly financing rate
    const leaserFinancingRateMonthly = calculateMonthlyRate(leaserFinancingRateAnnual);

    // Calculate Ejaar annual financing rate
    const ejaarFinancingRateAnnual = calculateEjaarFinancingRateAnnual(
        leaserFinancingRateAnnual,
        financingSpreadAnnual
    );

    // Calculate Ejaar monthly financing rate
    const ejaarFinancingRateMonthly = calculateMonthlyRate(ejaarFinancingRateAnnual);

    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(
        totalAmount,
        residualValue,
        ejaarFinancingRateMonthly * 100, // Convert back to percentage for the function
        durationMonths
    );

    // Calculate total payment
    const totalPayment = calculateTotalPayment(monthlyPayment, durationMonths);

    return {
        residualValue,
        leaserFinancingRateMonthly: leaserFinancingRateMonthly * 100, // Convert to percentage
        ejaarFinancingRateAnnual,
        ejaarFinancingRateMonthly: ejaarFinancingRateMonthly * 100, // Convert to percentage
        monthlyPayment,
        totalPayment
    };
}
