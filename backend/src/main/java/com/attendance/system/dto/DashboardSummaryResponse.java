package com.attendance.system.dto;

public class DashboardSummaryResponse {

    private long totalStudents;
    private long totalFaculty;
    private double todayAttendancePercentage;
    private long presentTodayCount;
    private long pendingFeedback;

    public DashboardSummaryResponse() {
    }

    public DashboardSummaryResponse(long totalStudents, long totalFaculty,
                                    double todayAttendancePercentage,
                                    long presentTodayCount, long pendingFeedback) {
        this.totalStudents = totalStudents;
        this.totalFaculty = totalFaculty;
        this.todayAttendancePercentage = todayAttendancePercentage;
        this.presentTodayCount = presentTodayCount;
        this.pendingFeedback = pendingFeedback;
    }

    public long getTotalStudents() {
        return totalStudents;
    }

    public void setTotalStudents(long totalStudents) {
        this.totalStudents = totalStudents;
    }

    public long getTotalFaculty() {
        return totalFaculty;
    }

    public void setTotalFaculty(long totalFaculty) {
        this.totalFaculty = totalFaculty;
    }

    public double getTodayAttendancePercentage() {
        return todayAttendancePercentage;
    }

    public void setTodayAttendancePercentage(double todayAttendancePercentage) {
        this.todayAttendancePercentage = todayAttendancePercentage;
    }

    public long getPresentTodayCount() {
        return presentTodayCount;
    }

    public void setPresentTodayCount(long presentTodayCount) {
        this.presentTodayCount = presentTodayCount;
    }

    public long getPendingFeedback() {
        return pendingFeedback;
    }

    public void setPendingFeedback(long pendingFeedback) {
        this.pendingFeedback = pendingFeedback;
    }
}
