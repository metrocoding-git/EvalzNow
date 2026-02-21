export function buildGlobalEZReport({ client, totalCandidates,  analytics, thresholds }) {
  const today = new Date().toDateString();
    const pct = (v, total) =>
      total ? (v / total).toFixed(3) : "0.000";
  
    const fmt = (v) =>
      v === null || v === undefined ? "0.000" : Number(v).toFixed(3);
  
    const fmtFraction = (v) =>
      v === null || v === undefined ? "0.000" : (Number(v) / 100).toFixed(3);
    
    const totalAssessmentBlocks = Object.values(analytics.assessmentBlocks || {})
  .reduce((sum, v) => sum + (Number(v) || 0), 0);

    const totalUnitOutcomes = Object.values(analytics.unitOutcomes || {})
    .reduce((sum, v) => sum + (Number(v) || 0), 0);
    return `
                                                     **                                                                           **
                                                     **                          EvalzNow Latest Edition                          **
                                                     **                                                                           **
                                                     **                     Human Capital Assessment Software                     **
                                                     **                              Ricky D. Butler                              **
                                                     **                                                                           **
                                                     **                                                                           **
                                                     **             The First Comprehensive Assessment Solution for               **
                                                     **                           Industry and Education                          **
                                                     **                                                                           **
                                                     **                      Unit Developmental Capabilities                      **
                                                     **                                                                           **
                                                     **                  Quantitative and Qualitative Assessments                 **
                                                     **                   Hybrid Proficiency & Growth Monitoring                  **
                                                     **                            Competency Accounting                          **
                                                     **                                                                           **
                                                     **                      Analysis Report Level: Global / Institutional        **
                                                     **                    Report Generation Date: ${today}                **
                                                     **                                                                           **
                                                     *******************************************************************************
                                                     **                  All Rights Reserved. COPYRIGHT (C) ${new Date().getFullYear()}                  **
                                                     **                   Compiled for Subscriber End User Use                    **
                                                     **     Decompilation or disassembly of this software strictly prohibited.    **
                                                     *******************************************************************************

*******************************************************                                 INTRODUCTION                              *******************************************************

     EvalzNow provides detailed, human capital assessments using an innovative approach known as Competency Accounting.  As the approach suggests, Competency Accounting is the
     measurement, the processing, and the communication of quantitative information and qualitative information regarding any performance-based entity such as students, employees, AI 
     humanoids, educational facilities, businesses, defense agencies, and so forth.  The foundation of the Competency Accounting approach centers on grouping independent variables 
     pertaining to the cerebral structure into exclusive categories prior to data processing for proficiency and growth.

     Proficiency, which passes the accountability to the candidate, is a static metric that is used to determine if a candidate can meet or can exceed a predefined benchmark or a 
     baseline threshold.  This determination is based on the candidate’s ability to demonstrate mastery of core concepts/principles at a fixed point in time.

     Growth, which passes the accountability to the leader (instructor, manager, etc.), refers to the differential changes in productive skills and in receptive skills from one 
     performance point to another performance point. These differential changes, which can be correlated with normative measures at a candidate level, a unit level, or an institutional
     level, are dynamic indications of the direction of candidate progress.

     End Users are free to use data outputs, data extractions, and data reports at their lawful discretion; however, the Creator will not be held liable for the decisions of End Users 
     and the actions of End Users based on subjective interpretations.  Educators, instructors, executives, managers, and administrators should exercise sound judgment by combining 
     EvalzNow outputs with real-life observations, relatable experience, and direct accounts.

  
  *******************************************************  SECTION 01  *******************************************************
  
  ---------------------------------------
  CLIENT DETAILS :
  ---------------------------------------
  
  Executive ID                         :     ${client.executiveId}
  Company Name                         :     ${client.companyName}
  Company Contact Number               :     ${client.companyContactNumber}
  Institutional Type                   :     ${client.institutionalType}
  Country                              :     ${client.country}
  Company Size                         :     ${client.companySize?.candidate}
  
  Total Unit Count                     :     ${analytics.totalUnits}
  Total Candidate Count                :     ${totalCandidates}
  
  *******************************************************  SECTION 02  *******************************************************
  
  ---------------------------------------
  SIGNATURE PROFILE SELECTIONS:
  ---------------------------------------
  
  Global Percentage of Case 1 Profiles      :     ${pct(analytics.signatureProfiles["Case 1: Solid Balanced"], analytics.totalUnits)}
  Global Percentage of Case 2 Profiles      :     ${pct(analytics.signatureProfiles["Case 2: Rigorous Balanced"], analytics.totalUnits)}
  Global Percentage of Case 3a Profiles     :     ${pct(analytics.signatureProfiles["Case 3a: Productive-Weighted"], analytics.totalUnits)}
  Global Percentage of Case 3b Profiles     :     ${pct(analytics.signatureProfiles["Case 3b: Receptive-Weighed"], analytics.totalUnits)}
  
  ---------------------------------------
  UNIT TYPE SELECTIONS:
  ---------------------------------------
  
  Global Percentage of CI/CO                :     ${pct(analytics.unitTypes["Communicative I/O"], analytics.totalUnits)}
  Global Percentage of T&P                  :     ${pct(analytics.unitTypes["Theory & Practice"], analytics.totalUnits)}
  Global Percentage of Third Parameter      :     ${pct(analytics.unitTypes["Third Parameter"], analytics.totalUnits)}
  
  ---------------------------------------
  EFFECTIVITY OF UNITS:
  ---------------------------------------
  
  % Benchmark Counts, BC ≤ 10               :     ${pct(analytics.benchmarkCounts["BC ≤ 10"], analytics.totalUnits)}
  % Benchmark Counts, 10 < BC ≤ 25          :     ${pct(analytics.benchmarkCounts["10 < BC ≤ 25"], analytics.totalUnits)}
  % Benchmark Counts, BC > 25               :     ${pct(analytics.benchmarkCounts["BC > 25"], analytics.totalUnits)}
  
  % Assessment Blocks, AB ≤ 8               :     ${pct(analytics.assessmentBlocks["AB ≤ 8"], totalAssessmentBlocks)}
  % Assessment Blocks, 8 < AB ≤ 20          :     ${pct(analytics.assessmentBlocks["8 < AB ≤ 20"], totalAssessmentBlocks)}
  % Assessment Blocks, AB > 20              :     ${pct(analytics.assessmentBlocks["AB > 20"], totalAssessmentBlocks)}

  % Attendance - Present                    :     ${fmtFraction(analytics.attendance.present)}
  % Attendance - Excused Absences           :     ${fmtFraction(analytics.attendance.excusedAbsences)}
  % Attendance - Unexcused Absences         :     ${fmtFraction(analytics.attendance.unexcusedAbsences)}
  % Attendance - Excused Tardies            :     ${fmtFraction(analytics.attendance.excusedTardies)}
  % Attendance - Unexcused Tardies          :     ${fmtFraction(analytics.attendance.unexcusedTardies)}

  % Action Status - Open                    :     ${fmtFraction(analytics.needAssessments.open)}
  % Positive Candidate Marks                :     ${fmtFraction(analytics.candidateMarks.impactScore)}
  % Positive Leader Marks                   :     ${fmtFraction(analytics.leaderMarks.impactScore)}

  % Passing Candidates                      :     ${pct(analytics.unitOutcomes.Pass, totalUnitOutcomes)}
  % Failed Candidates                       :     ${pct(analytics.unitOutcomes.Fail, totalUnitOutcomes)}
  % Ongoing Candidates                      :     ${pct(analytics.unitOutcomes.Ongoing, totalUnitOutcomes)}


  
  *******************************************************  SECTION 03  *******************************************************
  
  ---------------------------------------
  PROFICIENCY OUTCOMES OF ALL UNITS:
  ---------------------------------------
  
  % Passed Average Unilateral  - XRR        :     ${fmt(thresholds.regularMetrics.XRR.successRate)}
  % Passed Average Unilateral  - XLR        :     ${fmt(thresholds.regularMetrics.XLR.successRate)}
  % Passed Average Unilateral  - XWR        :     ${fmt(thresholds.regularMetrics.XWR.successRate)}
  % Passed Average Unilateral  - XSR        :     ${fmt(thresholds.regularMetrics.XSR.successRate)}
  
  % Passed Average Unilateral  - XTR        :     ${fmt(thresholds.regularMetrics.XTR.successRate)}
  % Passed Average Unilateral  - XPR        :     ${fmt(thresholds.regularMetrics.XPR.successRate)}
  
  % Passed Average Unilateral  - XRVSR      :     ${fmt(thresholds.regularMetrics.XRVSR.successRate)}
  % Passed Average Unilateral  - XPVSR      :     ${fmt(thresholds.regularMetrics.XPVSR.successRate)}
  % Passed Average Unilateral  - XAVSR      :     ${fmt(thresholds.regularMetrics.XAVSR.successRate)}
  
  % Passed Average Equivalent Prof - XEP    :     ${fmt(thresholds.regularMetrics.XEP.successRate)}
  % Passed Average Composite Prof - XCP     :     ${fmt(thresholds.regularMetrics.XCP.successRate)}
  % Passed Average Band Prof - XBP          :     ${fmt(thresholds.regularMetrics.XBP.successRate)}
  
  ---------------------------------------
  GROWTH OUTCOMES OF ALL UNITS:
  ---------------------------------------
  
  % Passed Average Growth - ∆RR             :     ${fmt(thresholds.averageDeltaMetrics.avgDeltaRRN.successRate)}
  % Passed Average Growth - ∆PR             :     ${fmt(thresholds.averageDeltaMetrics.avgDeltaPRN.successRate)}
  % Passed Average Growth - ∆AR             :     ${fmt(thresholds.averageDeltaMetrics.avgDeltaARN.successRate)}
  
  % Passed Cumulative Growth - ∆RR          :     ${fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaRRN.successRate)}
  % Passed Cumulative Growth - ∆PR          :     ${fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaPRN.successRate)}
  % Passed Cumulative Growth - ∆AR          :     ${fmt(thresholds.cumulativeSumDeltaMetrics.sumDeltaARN.successRate)}
  
  ---------------------------------------
 NOMENCLATURE:
---------------------------------------

     ∆ARN                                      :     Acuity Ratio Growth Differential
     ∆GEQ                                      :     Equivalent Growth
     ∆PRN                                      :     Productive Ratio Growth Differential
     ∆RRN                                      :     Receptive Ratio Growth Differential
     AAVS                                      :     Attained Acuity Variable Scores
     ALS                                       :     Attained Listening Score
     APS                                       :     Attained Practical Score
     APVS                                      :     Attained Productive Variable Scores
     AR                                        :     Acuity Ratio of Outputs
     ARGT                                      :     Projected Acuity Ratio Component for Growth Target
     ARN                                       :     Acuity Ratio of the Performance Point
     ARS                                       :     Attained Reading Score
     ARVS                                      :     Attained Receptive Variable Scores
     ASP                                       :     Attained Speaking Score
     ATS                                       :     Attained Theory-Based Score
     AWS                                       :     Attained Writing Score
     BID                                       :     Benchmark ID
     CID                                       :     Candidate ID
     CSD                                       :     Candidate Start Date
     DC                                        :     Day Count
     GT                                        :     Growth Target of a Performance Point
     IC                                        :     Interaction Class Based on Performance Point
     IEP                                       :     Individualized Educational Plan
     MAVS                                      :     Maximum Acuity Variable Scores
     MGS                                       :     Maximum Grammar Score
     MLS                                       :     Maximum Listening Score
     MPS                                       :     Maximum Practical Score
     MPVS                                      :     Maximum Productive Variable Scores
     MRS                                       :     Maximum Reading Score
     MRVS                                      :     Maximum Receptive Variable Scores
     MSIP                                      :     Margins of Interaction Proficiency
     MSS                                       :     Maximum Speaking Score
     MTS                                       :     Maximum Theory-Based Score
     MWS                                       :     Maximum Writing Score
     PP                                        :     Performance Point
     PR                                        :     Productive Ratio of Outputs
     PRGT                                      :     Projected Productive Ratio Component for Growth Target
     PRN                                       :     Productive Ratio of the Performance Point
     PTP                                       :     Projection Termination Point
     RMS                                       :     Root Mean Square
     RR                                        :     Receptive Ratio of Inputs
     RRGT                                      :     Projected Receptive Ratio Component for Growth Target
     RRN                                       :     Receptive Ratio of the Performance Point
     SGP                                       :     Student Growth Percentile
     SLA                                       :     Student Language Acquisition
     SMART                                     :     Specific/Measurable/Attainable/Relevancy (Realistic)/Time-Bound
     STA/G                                     :     Stability in Growth
     STA/P                                     :     Stability in Proficiency
     TEFL                                      :     Teaching English as a Foreign Language
     TTT                                       :     Teacher Talk Time
     USD                                       :     Unit Start Date
     VAM                                       :     Value-Added Model
     VTM                                       :     Value-Table Model
     XAVSR                                     :     Acuity Variable Scoring Ratio
     XBP                                       :     Band Proficiency
     XCP                                       :     Composite Proficiency
     XEP                                       :     Equivalent Proficiency
     XLR                                       :     Listening Ratio
     XPR                                       :     Practical Ratio
     XPVSR                                     :     Productive Variable Scoring Ratio
     XRR                                       :     Reading Ratio
     XRVSR                                     :     Receptive Variable Scoring Ratio
     XSR                                       :     Speaking Ratio
     XTR                                       :     Theory-Based Ratio
     XWR                                       :     Writing Ratio

---------------------------------------
 LEGAL NOTICE:
---------------------------------------

     Unless otherwise indicated, EvalzNow is the intellectual property of Ricky D. Butler (the Creator). All source codes, database builds, functionality, designs, logos, theories, 
	 proprietary techniques, utilities, and methodologies are owned, are controlled, and are licensed to the Creator under applicable copyright laws and unfair competition laws of the 
	 United States, foreign jurisdictions, and international conventions – whichever is more severe.

     All rights reserved. No part of this application or works associated with the development of the application may be reproduced, may be distributed, may be rewritten, may be edited, 
	 may be modified, or may be transmitted in any form or by any means, including photocopying, recording, or other electronic or mechanical methods, without the prior written consent
	 of the Creator. This includes any derivative works, any parallel works, or seemingly similar works of any form of any industry-related field – public or private.

     The aforementioned restrictions above also apply to the concept of Competency Accounting, which is an innovative idea that belongs to Ricky D. Butler.  This idea cannot be applied 
	 in any manner, direct or indirect, without the written approval of the Creator.  Any unlawful use of the concept of Competency Accounting is subject to applicable copyright laws 
	 and unfair competition laws of the United States, foreign jurisdictions, and international conventions – whichever is more severe.

     For Fair Use cases, any entity using our copywritten material for, but not limited to, criticism, commentary, news reporting, teaching, scholarship, research, or informative 
	 purposes must attribute the work to the Creator.  The attribution is required regardless of the non-commercial intent, the educational intent, the scientific intent, or the 
	 historical intent even if the purpose is transformative.  Please reach out to the Creator or the EvalzNow team for general inquiries or official requests.

     End Users, however, are free to use database feeds, data analytics, data extractions, and data reports at their lawful discretion.

                                                     *******************************************************************************
                                                     **                               End of Report                               **
                                                     *******************************************************************************`;
  }
  