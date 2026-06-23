import React from 'react';
import { PredictionResponse, UserMode } from '../types';
import { ApiUtils } from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';
// jsPDF is imported dynamically inside saveAsPDF to avoid bundle issues

interface PredictionResultsProps {
  prediction: PredictionResponse;
  userMode: UserMode;
  hasHandwriting: boolean;
  predictionType?: 'features-only' | 'image-only' | 'ensemble';
  onNewAssessment: () => void;
}

const PredictionResults: React.FC<PredictionResultsProps> = ({ 
  prediction, 
  userMode, 
  hasHandwriting, 
  predictionType = 'ensemble',
  onNewAssessment 
}) => {

  // ─── SAVE AS PDF using jsPDF (direct .pdf download, one click) ──────────
  const saveAsPDF = () => {
    // Dynamically import jsPDF to avoid SSR issues
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

      const isNoDementia  = prediction.prediction === 0;
      const riskLabel     = isNoDementia ? 'No Dementia Detected' : 'Dementia Detected';
      const analysisType  = hasHandwriting ? 'Clinical + Handwriting (Ensemble)' : 'Clinical Data Only';
      const confidence    = (prediction.confidence * 100).toFixed(1);
      const noDemProb     = (prediction.probs[0] * 100).toFixed(1);
      const demProb       = (prediction.probs[1] * 100).toFixed(1);
      const recommendations = isNoDementia ? [
        'Maintain healthy lifestyle habits',
        'Stay physically and mentally active',
        'Follow up with your doctor regularly',
        'Continue monitoring cognitive health'
      ] : [
        'Consult with your doctor about these results',
        'Consider comprehensive medical evaluation',
        'Early detection allows for better planning',
        'Maintain healthy lifestyle and social connections'
      ];

      const pageW  = 210;
      const margin = 20;
      const contentW = pageW - margin * 2;
      let y = 20;

      // ── HEADER ──────────────────────────────────────────────────────────────
      doc.setFillColor(79, 70, 229); // indigo
      doc.rect(0, 0, pageW, 38, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('Neuro Trace', margin, 17);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('AI-Powered Cognitive Health Assessment Report', margin, 26);
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString()}    |    Report ID: ${Date.now()}`, margin, 34);

      y = 50;

      // ── RESULT BOX ──────────────────────────────────────────────────────────
      const boxColor = isNoDementia ? [209, 250, 229] : [254, 226, 226];
      const textColor = isNoDementia ? [6, 95, 70] : [153, 27, 27];
      doc.setFillColor(boxColor[0], boxColor[1], boxColor[2]);
      doc.roundedRect(margin, y, contentW, 38, 4, 4, 'F');

      doc.setTextColor(textColor[0], textColor[1], textColor[2]);
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text(riskLabel, pageW / 2, y + 13, { align: 'center' });

      doc.setFontSize(13);
      doc.text(`Confidence: ${confidence}%`, pageW / 2, y + 23, { align: 'center' });

      doc.setFontSize(11);
      doc.text(`Risk Level: ${formattedResult.riskLevel}`, pageW / 2, y + 32, { align: 'center' });

      y += 48;

      // ── PROBABILITY BREAKDOWN ────────────────────────────────────────────────
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(margin, y, contentW / 2 - 4, 52, 3, 3, 'F');

      doc.setTextColor(55, 65, 81);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Probability Breakdown', margin + 4, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      const rows = [
        ['No Dementia', `${noDemProb}%`, isNoDementia ? [16, 185, 129] : [107, 114, 128]],
        ['Dementia Risk', `${demProb}%`, !isNoDementia ? [239, 68, 68] : [107, 114, 128]],
        ['Model Confidence', `${confidence}%`, [79, 70, 229]],
        ['Analysis Mode', analysisType, [107, 114, 128]],
      ];

      rows.forEach(([label, value, color], i) => {
        const rowY = y + 20 + i * 9;
        doc.setTextColor(55, 65, 81);
        doc.text(label as string, margin + 4, rowY);
        doc.setTextColor((color as number[])[0], (color as number[])[1], (color as number[])[2]);
        doc.setFont('helvetica', 'bold');
        doc.text(value as string, margin + contentW / 2 - 8, rowY, { align: 'right' });
        doc.setFont('helvetica', 'normal');
      });

      // ── RECOMMENDATIONS ──────────────────────────────────────────────────────
      const recX = margin + contentW / 2 + 4;
      const recW = contentW / 2 - 4;
      doc.setFillColor(249, 250, 251);
      doc.roundedRect(recX, y, recW, 52, 3, 3, 'F');

      doc.setTextColor(55, 65, 81);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('Recommendations', recX + 4, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      recommendations.forEach((rec, i) => {
        doc.setTextColor(79, 70, 229);
        doc.text('✓', recX + 4, y + 20 + i * 9);
        doc.setTextColor(55, 65, 81);
        doc.text(rec, recX + 10, y + 20 + i * 9);
      });

      y += 62;

      // ── DISCLAIMER ───────────────────────────────────────────────────────────
      doc.setFillColor(255, 251, 235);
      doc.roundedRect(margin, y, contentW, 28, 3, 3, 'F');
      doc.setTextColor(146, 64, 14);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('⚠  Important Medical Disclaimer', margin + 4, y + 9);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      const disclaimer = 'This assessment is for screening purposes only and should not be used as a definitive diagnosis. Always consult qualified healthcare professionals for proper medical diagnosis and treatment decisions.';
      const lines = doc.splitTextToSize(disclaimer, contentW - 8);
      doc.text(lines, margin + 4, y + 17);

      y += 36;

      // ── FOOTER ───────────────────────────────────────────────────────────────
      doc.setDrawColor(229, 231, 235);
      doc.line(margin, y, pageW - margin, y);
      doc.setTextColor(156, 163, 175);
      doc.setFontSize(8);
      doc.text('Generated by Neuro Trace – AI-Powered Dementia Detection System', pageW / 2, y + 7, { align: 'center' });

      // ── SAVE ─────────────────────────────────────────────────────────────────
      doc.save(`neuro-trace-report-${Date.now()}.pdf`);
    });
  };

  // ─── PRINT RESULTS ───────────────────────────────────────────────────────
  const printResults = () => {
    window.print();
  };

  // ─── EMAIL RESULTS ───────────────────────────────────────────────────────
  const emailResults = () => {
    const subject = encodeURIComponent('Neuro Trace – Cognitive Assessment Results');
    const riskLabel = prediction.prediction === 0 ? 'No Dementia Detected' : 'Dementia Risk Detected';
    const body = encodeURIComponent(
`Neuro Trace – Cognitive Health Assessment Report
================================================

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Analysis Type: ${hasHandwriting ? 'Clinical + Handwriting (Ensemble)' : 'Clinical Data Only'}

RESULT: ${riskLabel}
Confidence: ${(prediction.confidence * 100).toFixed(1)}%
Risk Level: ${formattedResult.riskLevel}

Probability Breakdown:
  • No Dementia:   ${(prediction.probs[0] * 100).toFixed(1)}%
  • Dementia Risk: ${(prediction.probs[1] * 100).toFixed(1)}%

IMPORTANT NOTICE:
This assessment is for screening purposes only and should not
replace a comprehensive clinical evaluation by a qualified
healthcare professional.

Generated by Neuro Trace – AI-Powered Dementia Detection
Report ID: ${Date.now()}
`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  // ─── GENERATE TXT REPORT (doctors) ───────────────────────────────────────
  const generateReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      analysisType: hasHandwriting ? 'Ensemble Analysis' : 'Clinical Data Analysis',
      prediction: prediction.prediction,
      confidence: (prediction.confidence * 100).toFixed(1),
      probabilities: {
        noDementia: (prediction.probs[0] * 100).toFixed(1),
        dementia: (prediction.probs[1] * 100).toFixed(1)
      },
      riskLevel: formattedResult.riskLevel,
      assessment: prediction.prediction === 0 
        ? 'Low risk of dementia detected. Routine monitoring recommended.'
        : 'Elevated risk indicators detected. Further clinical evaluation advised.'
    };

    const reportContent = `
ALZHEIMER'S DEMENTIA RISK ASSESSMENT REPORT
===========================================

Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}
Analysis Type: ${reportData.analysisType}

ASSESSMENT RESULTS:
------------------
Risk Level: ${reportData.riskLevel}
Confidence: ${reportData.confidence}%

Probability Distribution:
• No Dementia: ${reportData.probabilities.noDementia}%
• Dementia Risk: ${reportData.probabilities.dementia}%

CLINICAL INTERPRETATION:
-----------------------
${reportData.assessment}

CLINICAL RECOMMENDATIONS:
------------------------
• Consider comprehensive neuropsychological evaluation
• Monitor cognitive function over time
• Discuss lifestyle interventions
• Follow established clinical guidelines
• Regular follow-up assessments recommended

DISCLAIMER:
----------
This assessment is a screening tool and should not replace comprehensive clinical evaluation.
Results should be interpreted in conjunction with clinical history, examination, and other diagnostic tests.

Generated by Neuro Trace – AI-Powered Dementia Detection
Report ID: ${Date.now()}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuro-trace-report-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formattedResult = ApiUtils.formatPredictionResult(prediction);
  const probabilities = ApiUtils.getProbabilityPercentages(prediction.probs);

  const pieData = [
    { name: 'No Dementia', value: prediction.probs[0] * 100, color: '#10B981' },
    { name: 'Dementia Risk', value: prediction.probs[1] * 100, color: '#EF4444' }
  ];

  const barData = [
    { category: 'No Dementia', probability: prediction.probs[0] * 100, fill: '#10B981' },
    { category: 'Dementia Risk', probability: prediction.probs[1] * 100, fill: '#EF4444' }
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'Low': return 'text-green-700 bg-green-100';
      case 'Moderate': return 'text-yellow-700 bg-yellow-100';
      case 'High': return 'text-red-700 bg-red-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getRecommendations = () => {
    if (userMode === 'doctor') {
      return prediction.prediction === 0 ? [
        'Continue routine cognitive monitoring',
        'Maintain current treatment protocols',
        'Schedule follow-up in 6-12 months',
        'Consider lifestyle counseling if risk factors present'
      ] : [
        'Recommend comprehensive neuropsychological evaluation',
        'Consider referral to memory clinic',
        'Discuss findings with patient and family',
        'Implement cognitive monitoring protocol',
        'Review medication regimen'
      ];
    } else {
      return prediction.prediction === 0 ? [
        'Maintain healthy lifestyle habits',
        'Stay physically and mentally active',
        'Follow up with your doctor regularly',
        'Continue monitoring cognitive health'
      ] : [
        'Consult with your doctor about these results',
        'Consider comprehensive medical evaluation',
        "Don't panic - early detection allows for better planning",
        'Maintain healthy lifestyle and social connections'
      ];
    }
  };

  return (
    <div className="p-8" id="neurotrace-results">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Assessment Results</h2>
          <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
            <p>
              {hasHandwriting 
                ? 'Based on clinical data and handwriting analysis'
                : 'Based on clinical data analysis'
              }
            </p>
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {predictionType.replace('-', ' ').toUpperCase()} MODE
            </span>
          </div>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="text-center mb-6">
            <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
              prediction.prediction === 0 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {prediction.prediction === 0 ? (
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              )}
              {formattedResult.result}
            </div>
            
            <div className="mt-4 space-y-2">
              <p className="text-2xl font-bold text-gray-900">
                Confidence: {formattedResult.confidence}
              </p>
              <p className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRiskLevelColor(formattedResult.riskLevel)}`}>
                Risk Level: {formattedResult.riskLevel}
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Probability Distribution</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={5} dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Probability']} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Detailed Probabilities</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Probability']} />
                  <Bar dataKey="probability" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Analysis Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">No Dementia Probability:</span>
                <span className="font-medium text-green-600">{probabilities.noDementia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dementia Risk Probability:</span>
                <span className="font-medium text-red-600">{probabilities.dementia}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Model Confidence:</span>
                <span className="font-medium">{formattedResult.confidence}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Analysis Type:</span>
                <span className="font-medium">
                  {hasHandwriting ? 'Clinical + Handwriting' : 'Clinical Only'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {userMode === 'doctor' ? 'Clinical Recommendations' : 'Next Steps'}
            </h3>
            <ul className="space-y-2">
              {getRecommendations().map((recommendation, index) => (
                <li key={index} className="flex items-start">
                  <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-gray-700 text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-yellow-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">Important Notice</h3>
              <p className="text-yellow-800 mb-2">
                This assessment is for screening purposes only and should not be used as a definitive diagnosis. 
                {userMode === 'doctor' 
                  ? ' Use these results as part of a comprehensive clinical evaluation.'
                  : ' Always consult with qualified healthcare professionals for proper medical diagnosis and treatment.'
                }
              </p>
              <p className="text-yellow-800 text-sm">
                Early detection tools can help identify potential risks, but clinical judgment and comprehensive 
                medical evaluation remain essential for accurate diagnosis and treatment planning.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center no-print">
          <button onClick={onNewAssessment} className="btn-medical px-8 py-3">
            New Assessment
          </button>
          <button onClick={printResults} className="btn-secondary px-8 py-3">
            Print Results
          </button>
          {userMode === 'doctor' && (
            <button className="btn-secondary px-8 py-3" onClick={generateReport}>
              Generate Report
            </button>
          )}
        </div>

        {/* Save / Export Options */}
        <div className="text-center no-print">
          <p className="text-sm text-gray-500 mb-2">
            Results are shown for this session only. Consider saving or printing for your records.
          </p>
          <div className="flex justify-center space-x-4 text-sm">
            {/* ✅ FIXED: Save as PDF now works */}
            <button
              onClick={saveAsPDF}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Save as PDF
            </button>
            {/* ✅ FIXED: Email Results now works */}
            <button
              onClick={emailResults}
              className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Email Results
            </button>
            {userMode === 'doctor' && (
              <button
                onClick={generateReport}
                className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
              >
                Add to Patient Record
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PredictionResults;