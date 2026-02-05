package in.main.service;

import org.apache.commons.math3.stat.regression.SimpleRegression;
import org.apache.commons.math3.stat.StatUtils;
import org.apache.commons.math3.stat.descriptive.DescriptiveStatistics;
import org.springframework.stereotype.Service;


import java.util.*;
import java.util.stream.Collectors;

/**
 * Advanced AI Service Implementation using ML libraries
 */
@Service
public class AdvancedAIServiceImpl implements AdvancedAIService {

    @Override
    public Map<Long, Double> predictDemandAdvanced(List<Map<String, Object>> historicalData) {
        Map<Long, Double> predictions = new HashMap<>();

        // Group data by product
        Map<Long, List<Map<String, Object>>> productData = historicalData.stream()
            .collect(Collectors.groupingBy(data -> ((Number) data.get("productId")).longValue()));

        for (Map.Entry<Long, List<Map<String, Object>>> entry : productData.entrySet()) {
            Long productId = entry.getKey();
            List<Map<String, Object>> data = entry.getValue();

            if (data.size() >= 5) { // Need minimum data points for ML
                try {
                    // Use Apache Commons Math for linear regression
                    SimpleRegression regression = new SimpleRegression();

                    // Prepare data for regression (time vs quantity)
                    for (int i = 0; i < data.size(); i++) {
                        double quantity = ((Number) data.get(i).get("quantity")).doubleValue();
                        regression.addData(i, quantity);
                    }

                    // Predict next period demand
                    double nextPeriodPrediction = regression.predict(data.size());

                    // Apply seasonal adjustment using Smile
                    double[] quantities = data.stream()
                        .mapToDouble(d -> ((Number) d.get("quantity")).doubleValue())
                        .toArray();

                    // Simple exponential smoothing for trend
                    double alpha = 0.3;
                    double smoothed = quantities[0];
                    for (int i = 1; i < quantities.length; i++) {
                        smoothed = alpha * quantities[i] + (1 - alpha) * smoothed;
                    }

                    // Combine regression and smoothing
                    double finalPrediction = (nextPeriodPrediction + smoothed) / 2.0;
                    predictions.put(productId, Math.max(finalPrediction, 0.0));

                } catch (Exception e) {
                    // Fallback to simple average
                    double avgDemand = data.stream()
                        .mapToDouble(d -> ((Number) d.get("quantity")).doubleValue())
                        .average()
                        .orElse(1.0);
                    predictions.put(productId, avgDemand);
                }
            } else {
                // Insufficient data, use average
                double avgDemand = data.stream()
                    .mapToDouble(d -> ((Number) d.get("quantity")).doubleValue())
                    .average()
                    .orElse(1.0);
                predictions.put(productId, avgDemand);
            }
        }

        return predictions;
    }

    @Override
    public List<Map<String, Object>> detectAdvancedAnomalies(List<Map<String, Object>> data) {
        List<Map<String, Object>> anomalies = new ArrayList<>();

        if (data.size() < 10) return anomalies; // Need minimum data for anomaly detection

        try {
            // Extract numerical values for analysis
            double[] values = data.stream()
                .mapToDouble(d -> {
                    Object value = d.get("value");
                    if (value instanceof Number) {
                        return ((Number) value).doubleValue();
                    }
                    return 0.0;
                })
                .toArray();

            // Use Apache Commons Math for statistical analysis
            DescriptiveStatistics stats = new DescriptiveStatistics(values);

            double mean = stats.getMean();
            double stdDev = stats.getStandardDeviation();
            double threshold = mean + 3 * stdDev; // 3-sigma rule for outliers

            // Detect anomalies
            for (int i = 0; i < data.size(); i++) {
                double value = values[i];
                if (Math.abs(value - mean) > 3 * stdDev) {
                    Map<String, Object> anomaly = new HashMap<>();
                    anomaly.put("index", i);
                    anomaly.put("value", value);
                    anomaly.put("expected", mean);
                    anomaly.put("deviation", Math.abs(value - mean));
                    anomaly.put("severity", Math.abs(value - mean) / stdDev);
                    anomaly.put("data", data.get(i));
                    anomalies.add(anomaly);
                }
            }

            // Additional anomaly detection using Gaussian-like threshold (fallback)
            double meanVal = StatUtils.mean(values);
            double std = Math.sqrt(StatUtils.variance(values));
            for (int i = 0; i < values.length; i++) {
                double z = std > 0 ? Math.abs((values[i] - meanVal) / std) : 0;
                if (z > 3) { // 3-sigma rule
                    Map<String, Object> anomaly = new HashMap<>();
                    anomaly.put("index", i);
                    anomaly.put("value", values[i]);
                    anomaly.put("zScore", z);
                    anomaly.put("method", "zscore");
                    anomaly.put("data", data.get(i));
                    anomalies.add(anomaly);
                }
            }

        } catch (Exception e) {
            // Fallback: simple threshold-based detection
            double[] values = data.stream()
                .mapToDouble(d -> ((Number) d.getOrDefault("value", 0)).doubleValue())
                .toArray();

            double mean = StatUtils.mean(values);
            double max = StatUtils.max(values);

            for (int i = 0; i < values.length; i++) {
                if (values[i] > mean * 2) {
                    Map<String, Object> anomaly = new HashMap<>();
                    anomaly.put("index", i);
                    anomaly.put("value", values[i]);
                    anomaly.put("method", "simple_threshold");
                    anomaly.put("data", data.get(i));
                    anomalies.add(anomaly);
                }
            }
        }

        return anomalies;
    }

    @Override
    public Map<String, Object> analyzeCustomerBehavior(List<Map<String, Object>> customerData) {
        Map<String, Object> analysis = new HashMap<>();

        if (customerData.size() < 5) {
            analysis.put("error", "Insufficient data for customer behavior analysis");
            return analysis;
        }

        try {
            // Prepare data for clustering (features: order frequency, avg order value, total spent)
            double[][] features = new double[customerData.size()][3];

            for (int i = 0; i < customerData.size(); i++) {
                Map<String, Object> customer = customerData.get(i);
                features[i][0] = ((Number) customer.getOrDefault("orderFrequency", 1)).doubleValue();
                features[i][1] = ((Number) customer.getOrDefault("avgOrderValue", 0)).doubleValue();
                features[i][2] = ((Number) customer.getOrDefault("totalSpent", 0)).doubleValue();
            }

            // Normalize features
            for (int j = 0; j < 3; j++) {
                double[] column = new double[features.length];
                for (int i = 0; i < features.length; i++) {
                    column[i] = features[i][j];
                }
                double mean = StatUtils.mean(column);
                double std = Math.sqrt(StatUtils.variance(column));
                for (int i = 0; i < features.length; i++) {
                    features[i][j] = (features[i][j] - mean) / std;
                }
            }

            // Simple segmentation fallback (no external KMeans dependency)
            int k = Math.max(1, Math.min(3, customerData.size() / 2));
            List<Integer> indices = new ArrayList<>();
            for (int i = 0; i < customerData.size(); i++) indices.add(i);
            // Sort by totalSpent descending
            indices.sort((a, b) -> {
                double va = ((Number) customerData.get(a).getOrDefault("totalSpent", 0)).doubleValue();
                double vb = ((Number) customerData.get(b).getOrDefault("totalSpent", 0)).doubleValue();
                return Double.compare(vb, va);
            });

            Map<String, Object> clusters = new HashMap<>();
            int sizePerCluster = Math.max(1, indices.size() / k);
            for (int i = 0; i < k; i++) {
                int start = i * sizePerCluster;
                int end = Math.min(start + sizePerCluster, indices.size());
                List<Map<String, Object>> clusterCustomers = new ArrayList<>();
                double[] centroid = new double[3];
                for (int j = start; j < end; j++) {
                    Map<String, Object> customer = customerData.get(indices.get(j));
                    clusterCustomers.add(customer);
                    centroid[0] += ((Number) customer.getOrDefault("orderFrequency", 0)).doubleValue();
                    centroid[1] += ((Number) customer.getOrDefault("avgOrderValue", 0)).doubleValue();
                    centroid[2] += ((Number) customer.getOrDefault("totalSpent", 0)).doubleValue();
                }
                if (!clusterCustomers.isEmpty()) {
                    centroid[0] /= clusterCustomers.size();
                    centroid[1] /= clusterCustomers.size();
                    centroid[2] /= clusterCustomers.size();
                }

                Map<String, Object> clusterInfo = new HashMap<>();
                clusterInfo.put("size", clusterCustomers.size());
                clusterInfo.put("centroid", centroid);
                clusterInfo.put("customers", clusterCustomers);

                String clusterType = classifyCluster(centroid);
                clusterInfo.put("type", clusterType);

                clusters.put("cluster_" + i, clusterInfo);
            }

            analysis.put("clusters", clusters);
            analysis.put("totalClusters", k);
            analysis.put("method", "simple_segmentation");

        } catch (Exception e) {
            // Fallback analysis
            analysis.put("method", "basic_analysis");
            analysis.put("error", "Advanced clustering failed: " + e.getMessage());

            // Basic segmentation
            List<Map<String, Object>> highValue = customerData.stream()
                .filter(c -> ((Number) c.getOrDefault("totalSpent", 0)).doubleValue() > 1000)
                .collect(Collectors.toList());

            List<Map<String, Object>> frequent = customerData.stream()
                .filter(c -> ((Number) c.getOrDefault("orderFrequency", 0)).intValue() > 5)
                .collect(Collectors.toList());

            analysis.put("highValueCustomers", highValue);
            analysis.put("frequentCustomers", frequent);
        }

        return analysis;
    }

    @Override
    public Map<String, Object> predictSystemMaintenance(List<Map<String, Object>> systemMetrics) {
        Map<String, Object> prediction = new HashMap<>();

        try {
            // Analyze system metrics for predictive maintenance
            List<Double> cpuUsage = new ArrayList<>();
            List<Double> memoryUsage = new ArrayList<>();
            List<Double> errorRates = new ArrayList<>();

            for (Map<String, Object> metric : systemMetrics) {
                cpuUsage.add(((Number) metric.getOrDefault("cpuUsage", 0)).doubleValue());
                memoryUsage.add(((Number) metric.getOrDefault("memoryUsage", 0)).doubleValue());
                errorRates.add(((Number) metric.getOrDefault("errorRate", 0)).doubleValue());
            }

            // Use regression to predict future values
            SimpleRegression cpuRegression = new SimpleRegression();
            SimpleRegression memoryRegression = new SimpleRegression();
            SimpleRegression errorRegression = new SimpleRegression();

            for (int i = 0; i < systemMetrics.size(); i++) {
                cpuRegression.addData(i, cpuUsage.get(i));
                memoryRegression.addData(i, memoryUsage.get(i));
                errorRegression.addData(i, errorRates.get(i));
            }

            // Predict next values
            int nextIndex = systemMetrics.size();
            double predictedCpu = cpuRegression.predict(nextIndex);
            double predictedMemory = memoryRegression.predict(nextIndex);
            double predictedErrors = errorRegression.predict(nextIndex);

            prediction.put("predictedCpuUsage", predictedCpu);
            prediction.put("predictedMemoryUsage", predictedMemory);
            prediction.put("predictedErrorRate", predictedErrors);

            // Maintenance recommendations
            List<String> recommendations = new ArrayList<>();
            if (predictedCpu > 85) {
                recommendations.add("High CPU usage predicted - consider scaling resources");
            }
            if (predictedMemory > 90) {
                recommendations.add("High memory usage predicted - monitor for memory leaks");
            }
            if (predictedErrors > 5) {
                recommendations.add("Increasing error rate detected - investigate system issues");
            }

            prediction.put("recommendations", recommendations);
            prediction.put("maintenanceNeeded", !recommendations.isEmpty());

        } catch (Exception e) {
            prediction.put("error", "Failed to predict maintenance needs: " + e.getMessage());
            prediction.put("maintenanceNeeded", false);
        }

        return prediction;
    }

    @Override
    public Map<String, Object> analyzeTicketSentiment(List<Map<String, Object>> ticketData) {
        Map<String, Object> analysis = new HashMap<>();

        try {
            // Basic sentiment analysis (can be enhanced with OpenNLP)
            Map<String, Integer> sentimentCounts = new HashMap<>();
            List<Map<String, Object>> sentimentDetails = new ArrayList<>();

            for (Map<String, Object> ticket : ticketData) {
                String subject = (String) ticket.getOrDefault("subject", "");
                String description = (String) ticket.getOrDefault("description", "");
                String text = (subject + " " + description).toLowerCase();

                String sentiment = analyzeSentiment(text);
                sentimentCounts.merge(sentiment, 1, Integer::sum);

                Map<String, Object> detail = new HashMap<>();
                detail.put("ticketId", ticket.get("id"));
                detail.put("sentiment", sentiment);
                detail.put("text", text.substring(0, Math.min(100, text.length())));
                sentimentDetails.add(detail);
            }

            analysis.put("sentimentDistribution", sentimentCounts);
            analysis.put("sentimentDetails", sentimentDetails);
            analysis.put("totalTickets", ticketData.size());

            // Calculate sentiment score
            double positiveScore = sentimentCounts.getOrDefault("POSITIVE", 0) * 1.0;
            double negativeScore = sentimentCounts.getOrDefault("NEGATIVE", 0) * (-1.0);
            double neutralScore = sentimentCounts.getOrDefault("NEUTRAL", 0) * 0.0;

            double overallSentiment = (positiveScore + negativeScore + neutralScore) / ticketData.size();
            analysis.put("overallSentimentScore", overallSentiment);

        } catch (Exception e) {
            analysis.put("error", "Sentiment analysis failed: " + e.getMessage());
        }

        return analysis;
    }

    @Override
    public List<Map<String, Object>> detectFraudulentActivity(List<Map<String, Object>> transactionData) {
        List<Map<String, Object>> fraudAlerts = new ArrayList<>();

        try {
            // Simple fraud detection based on statistical analysis
            double[] amounts = transactionData.stream()
                .mapToDouble(t -> ((Number) t.getOrDefault("amount", 0)).doubleValue())
                .toArray();

            DescriptiveStatistics stats = new DescriptiveStatistics(amounts);
            double mean = stats.getMean();
            double stdDev = stats.getStandardDeviation();

            // Flag transactions that are statistical outliers
            for (Map<String, Object> transaction : transactionData) {
                double amount = ((Number) transaction.getOrDefault("amount", 0)).doubleValue();

                if (amount > mean + 3 * stdDev) {
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("transactionId", transaction.get("id"));
                    alert.put("amount", amount);
                    alert.put("expectedAmount", mean);
                    alert.put("deviation", (amount - mean) / stdDev);
                    alert.put("riskLevel", "HIGH");
                    alert.put("reason", "Unusually large transaction amount");
                    fraudAlerts.add(alert);
                }
            }

            // Check for rapid successive transactions (potential card testing)
            for (int i = 1; i < transactionData.size(); i++) {
                Map<String, Object> current = transactionData.get(i);
                Map<String, Object> previous = transactionData.get(i - 1);

                // Assuming transactions have timestamps
                if (current.containsKey("timestamp") && previous.containsKey("timestamp")) {
                    // Simple frequency check - can be enhanced
                    double timeDiff = 1.0; // Placeholder for time difference calculation
                    if (timeDiff < 0.1) { // Very rapid transactions
                        Map<String, Object> alert = new HashMap<>();
                        alert.put("transactionId", current.get("id"));
                        alert.put("riskLevel", "MEDIUM");
                        alert.put("reason", "Rapid successive transactions detected");
                        fraudAlerts.add(alert);
                    }
                }
            }

        } catch (Exception e) {
            // Fallback fraud detection
            for (Map<String, Object> transaction : transactionData) {
                double amount = ((Number) transaction.getOrDefault("amount", 0)).doubleValue();
                if (amount > 10000) { // Simple threshold
                    Map<String, Object> alert = new HashMap<>();
                    alert.put("transactionId", transaction.get("id"));
                    alert.put("amount", amount);
                    alert.put("riskLevel", "HIGH");
                    alert.put("reason", "Transaction exceeds threshold");
                    fraudAlerts.add(alert);
                }
            }
        }

        return fraudAlerts;
    }

    @Override
    public Map<Long, Double> optimizePricing(List<Map<String, Object>> productData, List<Map<String, Object>> marketData) {
        Map<Long, Double> optimizedPrices = new HashMap<>();

        try {
            for (Map<String, Object> product : productData) {
                Long productId = ((Number) product.get("id")).longValue();
                double currentPrice = ((Number) product.get("price")).doubleValue();
                double cost = ((Number) product.getOrDefault("cost", currentPrice * 0.6)).doubleValue();
                int stock = ((Number) product.getOrDefault("quantity", 0)).intValue();

                // Simple dynamic pricing based on stock levels and market data
                double priceMultiplier = 1.0;

                // Increase price if stock is low (scarcity pricing)
                if (stock < 10) {
                    priceMultiplier = 1.2;
                } else if (stock < 50) {
                    priceMultiplier = 1.1;
                }

                // Adjust based on market demand (placeholder logic)
                double marketDemand = marketData.stream()
                    .filter(m -> ((Number) m.getOrDefault("productId", -1)).longValue() == productId)
                    .mapToDouble(m -> ((Number) m.getOrDefault("demand", 1)).doubleValue())
                    .average()
                    .orElse(1.0);

                if (marketDemand > 1.5) {
                    priceMultiplier *= 1.15;
                } else if (marketDemand < 0.5) {
                    priceMultiplier *= 0.9;
                }

                // Ensure price covers cost with reasonable margin
                double minPrice = cost * 1.2; // 20% margin minimum
                double optimizedPrice = Math.max(currentPrice * priceMultiplier, minPrice);

                // Cap maximum price increase
                optimizedPrice = Math.min(optimizedPrice, currentPrice * 1.5);

                optimizedPrices.put(productId, Math.round(optimizedPrice * 100.0) / 100.0);
            }

        } catch (Exception e) {
            // Fallback: return current prices
            for (Map<String, Object> product : productData) {
                Long productId = ((Number) product.get("id")).longValue();
                double currentPrice = ((Number) product.get("price")).doubleValue();
                optimizedPrices.put(productId, currentPrice);
            }
        }

        return optimizedPrices;
    }

    @Override
    public Map<String, Object> generateAIInsights(List<Map<String, Object>> systemData) {
        Map<String, Object> insights = new HashMap<>();

        try {
            List<String> recommendations = new ArrayList<>();
            Map<String, Object> metrics = new HashMap<>();

            // Analyze various system metrics
            double avgOrderValue = systemData.stream()
                .mapToDouble(d -> ((Number) d.getOrDefault("orderValue", 0)).doubleValue())
                .average()
                .orElse(0.0);

            double totalRevenue = systemData.stream()
                .mapToDouble(d -> ((Number) d.getOrDefault("revenue", 0)).doubleValue())
                .sum();

            long totalOrders = systemData.stream()
                .mapToLong(d -> ((Number) d.getOrDefault("orderCount", 0)).longValue())
                .sum();

            // Generate insights based on data analysis
            if (avgOrderValue > 100) {
                recommendations.add("High average order value indicates premium product focus - consider expanding luxury product line");
            } else if (avgOrderValue < 20) {
                recommendations.add("Low average order value suggests price-sensitive market - consider bundle offers or loyalty programs");
            }

            if (totalRevenue > 10000) {
                recommendations.add("Strong revenue performance - consider expansion or new market entry");
            }

            // Calculate growth trends
            List<Double> revenueTrend = systemData.stream()
                .map(d -> ((Number) d.getOrDefault("revenue", 0)).doubleValue())
                .collect(Collectors.toList());

            if (revenueTrend.size() >= 2) {
                double recentGrowth = (revenueTrend.get(revenueTrend.size() - 1) - revenueTrend.get(0)) / revenueTrend.get(0);
                if (recentGrowth > 0.2) {
                    recommendations.add("Strong revenue growth detected - maintain current strategies");
                } else if (recentGrowth < -0.1) {
                    recommendations.add("Revenue decline detected - review pricing and marketing strategies");
                }
            }

            metrics.put("averageOrderValue", avgOrderValue);
            metrics.put("totalRevenue", totalRevenue);
            metrics.put("totalOrders", totalOrders);
            metrics.put("conversionRate", totalOrders > 0 ? (double) totalRevenue / totalOrders : 0);

            insights.put("metrics", metrics);
            insights.put("recommendations", recommendations);
            insights.put("insightCount", recommendations.size());
            insights.put("generatedAt", new Date());

        } catch (Exception e) {
            insights.put("error", "Failed to generate AI insights: " + e.getMessage());
        }

        return insights;
    }

    // Helper methods

    private String classifyCluster(double[] centroid) {
        // Classify cluster based on centroid values (order frequency, avg order value, total spent)
        double frequency = centroid[0];
        double avgValue = centroid[1];
        double totalSpent = centroid[2];

        if (totalSpent > 1.0 && frequency > 0.5) {
            return "HIGH_VALUE_FREQUENT";
        } else if (totalSpent > 1.0) {
            return "HIGH_VALUE_INFREQUENT";
        } else if (frequency > 0.5) {
            return "LOW_VALUE_FREQUENT";
        } else {
            return "LOW_VALUE_INFREQUENT";
        }
    }

    private String analyzeSentiment(String text) {
        // Simple rule-based sentiment analysis
        String[] positiveWords = {"good", "great", "excellent", "amazing", "love", "best", "perfect", "happy", "satisfied", "thank"};
        String[] negativeWords = {"bad", "terrible", "awful", "hate", "worst", "angry", "disappointed", "problem", "issue", "broken"};

        int positiveCount = 0;
        int negativeCount = 0;

        for (String word : positiveWords) {
            if (text.contains(word)) positiveCount++;
        }

        for (String word : negativeWords) {
            if (text.contains(word)) negativeCount++;
        }

        if (positiveCount > negativeCount) {
            return "POSITIVE";
        } else if (negativeCount > positiveCount) {
            return "NEGATIVE";
        } else {
            return "NEUTRAL";
        }
    }
}
