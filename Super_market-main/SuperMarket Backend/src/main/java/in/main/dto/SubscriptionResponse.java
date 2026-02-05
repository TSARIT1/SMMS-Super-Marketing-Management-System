package in.main.dto;

public class SubscriptionResponse {
    private Long id;
    private String planType;
    private String status;
    private String startDate;
    private String endDate;
    private String trialEndDate;
    private boolean isTrialActive;
    private Double amountPaid;
    private int daysRemaining;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPlanType() {
        return planType;
    }

    public void setPlanType(String planType) {
        this.planType = planType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getStartDate() {
        return startDate;
    }

    public void setStartDate(String startDate) {
        this.startDate = startDate;
    }

    public String getEndDate() {
        return endDate;
    }

    public void setEndDate(String endDate) {
        this.endDate = endDate;
    }

    public String getTrialEndDate() {
        return trialEndDate;
    }

    public void setTrialEndDate(String trialEndDate) {
        this.trialEndDate = trialEndDate;
    }

    public boolean isTrialActive() {
        return isTrialActive;
    }

    public void setTrialActive(boolean trialActive) {
        isTrialActive = trialActive;
    }

    public Double getAmountPaid() {
        return amountPaid;
    }

    public void setAmountPaid(Double amountPaid) {
        this.amountPaid = amountPaid;
    }

    public int getDaysRemaining() {
        return daysRemaining;
    }

    public void setDaysRemaining(int daysRemaining) {
        this.daysRemaining = daysRemaining;
    }
}
