<?php

namespace Database\Seeders;

use App\Models\HseReport;
use App\Models\HseManHour;
use App\Models\HseLaggingIndicator;
use App\Models\HseLeadingIndicator;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class Kpi2026Seeder extends Seeder
{
    public function run(): void
    {
        DB::transaction(function () {
            $contractNo = 'SPHR01095C';
            $location = 'AREA WK ROKAN - RIAU';
            $year = 2026;
            $rigs = ['BMS#02', 'BMS#03', 'BMS#08'];

            // Monthly data mapping for Jan-Aug 2026
            $monthlyData = [
                '01' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 12405, 'p_act' => 12405, 'np_plan' => 3499, 'np_act' => 3499, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 9194, 'km_p_act' => 8398, 'km_np_plan' => 3575, 'km_np_act' => 3266],
                        'leading' => ['peka' => [118, 118], 'hazid' => [840, 976], 'swa' => [168, 161], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 4], 'tgm' => [56, 56], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'lead_forum' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 3544, 'p_act' => 3395, 'np_plan' => 1000, 'np_act' => 957, 'emp' => 12, 'veh' => 1, 'km_p_plan' => 2627, 'km_p_act' => 4444, 'km_np_plan' => 1022, 'km_np_act' => 1728],
                        'leading' => ['peka' => [118, 48], 'hazid' => [240, 304], 'swa' => [48, 49], 'apd' => [1, 1], 'drops' => [1, 1], 'vv' => [8, 8], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 3], 'tgm' => [16, 16], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'lead_forum' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [1, 1]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 2184, 'p_act' => 2122, 'np_plan' => 616, 'np_act' => 598, 'emp' => 11, 'veh' => 6, 'km_p_plan' => 10179, 'km_p_act' => 7277, 'km_np_plan' => 3958, 'km_np_act' => 2830],
                        'leading' => ['peka' => [118, 39], 'hazid' => [150, 190], 'swa' => [30, 25], 'apd' => [1, 1], 'drops' => [4, 1], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 1], 'tgm' => [10, 10], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'lead_forum' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 4], 'erp_rig' => [1, 1]]
                    ],
                ],
                '02' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 15904, 'p_act' => 15904, 'np_plan' => 3499, 'np_act' => 3499, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 9194, 'km_p_act' => 8398, 'km_np_plan' => 3575, 'km_np_act' => 3266],
                        'leading' => ['peka' => [114, 328], 'hazid' => [840, 912], 'swa' => [168, 186], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 4], 'tgm' => [56, 56], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'lead_forum' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 5], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 11881, 'p_act' => 11881, 'np_plan' => 3351, 'np_act' => 3351, 'emp' => 51, 'veh' => 5, 'km_p_plan' => 10179, 'km_p_act' => 6724, 'km_np_plan' => 3958, 'km_np_act' => 2615],
                        'leading' => ['peka' => [114, 240], 'hazid' => [840, 912], 'swa' => [168, 178], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 3], 'tgm' => [56, 56], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'lead_forum' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 11881, 'p_act' => 11881, 'np_plan' => 3351, 'np_act' => 3351, 'emp' => 57, 'veh' => 6, 'km_p_plan' => 10179, 'km_p_act' => 6974, 'km_np_plan' => 3958, 'km_np_act' => 2712],
                        'leading' => ['peka' => [114, 237], 'hazid' => [840, 1036], 'swa' => [168, 120], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 4], 'tgm' => [56, 56], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'lead_forum' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 4], 'erp_rig' => [3, 3]]
                    ],
                ],
                '03' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 17608, 'p_act' => 17608, 'np_plan' => 3874, 'np_act' => 3874, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 10179, 'km_p_act' => 5073, 'km_np_plan' => 3958, 'km_np_act' => 1973],
                        'leading' => ['peka' => [118, 337], 'hazid' => [930, 977], 'swa' => [186, 234], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 3], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 4], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 16864, 'p_act' => 16864, 'np_plan' => 3710, 'np_act' => 3710, 'emp' => 57, 'veh' => 5, 'km_p_plan' => 10179, 'km_p_act' => 7741, 'km_np_plan' => 3958, 'km_np_act' => 3011],
                        'leading' => ['peka' => [114, 279], 'hazid' => [930, 967], 'swa' => [186, 186], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 5], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 16864, 'p_act' => 16864, 'np_plan' => 3710, 'np_act' => 3710, 'emp' => 57, 'veh' => 5, 'km_p_plan' => 14137, 'km_p_act' => 8734, 'km_np_plan' => 3958, 'km_np_act' => 2446],
                        'leading' => ['peka' => [114, 256], 'hazid' => [930, 1046], 'swa' => [186, 186], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                ],
                '04' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 17040, 'p_act' => 15839, 'np_plan' => 3749, 'np_act' => 4435, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 10179, 'km_p_act' => 4082, 'km_np_plan' => 3958, 'km_np_act' => 1587],
                        'leading' => ['peka' => [118, 292], 'hazid' => [900, 761], 'swa' => [180, 189], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 4], 'tgm' => [60, 60], 'pre_hitch' => [3, 3], 'phr' => [4, 4], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 16320, 'p_act' => 15839, 'np_plan' => 3590, 'np_act' => 4435, 'emp' => 57, 'veh' => 6, 'km_p_plan' => 10179, 'km_p_act' => 9813, 'km_np_plan' => 3958, 'km_np_act' => 2748],
                        'leading' => ['peka' => [114, 275], 'hazid' => [900, 870], 'swa' => [180, 274], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 1], 'mwt' => [4, 5], 'tgm' => [60, 60], 'pre_hitch' => [3, 3], 'phr' => [4, 6], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 2]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 16320, 'p_act' => 13680, 'np_plan' => 3590, 'np_act' => 3830, 'emp' => 57, 'veh' => 5, 'km_p_plan' => 10179, 'km_p_act' => 11613, 'km_np_plan' => 3958, 'km_np_act' => 3252],
                        'leading' => ['peka' => [114, 282], 'hazid' => [900, 1045], 'swa' => [180, 172], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [60, 60], 'pre_hitch' => [3, 3], 'phr' => [4, 6], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                ],
                '05' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 17608, 'p_act' => 17608, 'np_plan' => 3874, 'np_act' => 3874, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 10179, 'km_p_act' => 7603, 'km_np_plan' => 3958, 'km_np_act' => 2129],
                        'leading' => ['peka' => [118, 333], 'hazid' => [930, 749], 'swa' => [186, 195], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'spot' => [1, 0], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'kampanye' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 16616, 'p_act' => 16864, 'np_plan' => 3656, 'np_act' => 3710, 'emp' => 57, 'veh' => 6, 'km_p_plan' => 10179, 'km_p_act' => 11841, 'km_np_plan' => 3958, 'km_np_act' => 3315],
                        'leading' => ['peka' => [114, 271], 'hazid' => [930, 1036], 'swa' => [186, 271], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'spot' => [1, 0], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'kampanye' => [1, 1], 'hygiene_noise' => [1, 0], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 16864, 'p_act' => 16864, 'np_plan' => 3710, 'np_act' => 3710, 'emp' => 57, 'veh' => 5, 'km_p_plan' => 10179, 'km_p_act' => 7101, 'km_np_plan' => 3958, 'km_np_act' => 1988],
                        'leading' => ['peka' => [114, 306], 'hazid' => [930, 1074], 'swa' => [186, 192], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'spot' => [1, 0], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 5], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'kampanye' => [1, 1], 'hygiene_noise' => [1, 0], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                ],
                '06' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 17040, 'p_act' => 17040, 'np_plan' => 3749, 'np_act' => 3749, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 10179, 'km_p_act' => 5042, 'km_np_plan' => 3958, 'km_np_act' => 1961],
                        'leading' => ['peka' => [118, 316], 'hazid' => [900, 952], 'swa' => [180, 180], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 5], 'tgm' => [60, 60], 'pre_hitch' => [3, 3], 'phr' => [4, 12], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 16080, 'p_act' => 16080, 'np_plan' => 3538, 'np_act' => 3538, 'emp' => 57, 'veh' => 6, 'km_p_plan' => 10179, 'km_p_act' => 7720, 'km_np_plan' => 3958, 'km_np_act' => 3002],
                        'leading' => ['peka' => [114, 244], 'hazid' => [900, 952], 'swa' => [180, 244], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 6], 'tgm' => [60, 60], 'pre_hitch' => [3, 3], 'phr' => [4, 12], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 16320, 'p_act' => 16320, 'np_plan' => 3590, 'np_act' => 3590, 'emp' => 57, 'veh' => 5, 'km_p_plan' => 10179, 'km_p_act' => 6032, 'km_np_plan' => 3958, 'km_np_act' => 2345],
                        'leading' => ['peka' => [114, 244], 'hazid' => [900, 900], 'swa' => [180, 187], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [60, 60], 'pre_hitch' => [3, 3], 'phr' => [4, 12], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                ],
                '07' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 17608, 'p_act' => 17608, 'np_plan' => 3874, 'np_act' => 3874, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 10179, 'km_p_act' => 4947, 'km_np_plan' => 3958, 'km_np_act' => 1923],
                        'leading' => ['peka' => [118, 370], 'hazid' => [930, 1019], 'swa' => [186, 188], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'hygiene_noise' => [1, 0], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 16616, 'p_act' => 16864, 'np_plan' => 3656, 'np_act' => 3710, 'emp' => 57, 'veh' => 6, 'km_p_plan' => 10179, 'km_p_act' => 7991, 'km_np_plan' => 3958, 'km_np_act' => 3107],
                        'leading' => ['peka' => [114, 264], 'hazid' => [930, 996], 'swa' => [186, 269], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 5], 'erp_rig' => [3, 5]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 16864, 'p_act' => 16864, 'np_plan' => 3710, 'np_act' => 3710, 'emp' => 57, 'veh' => 5, 'km_p_plan' => 10179, 'km_p_act' => 6032, 'km_np_plan' => 3958, 'km_np_act' => 2345],
                        'leading' => ['peka' => [114, 285], 'hazid' => [930, 1074], 'swa' => [186, 187], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'lh' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 4]]
                    ],
                ],
                '08' => [
                    'BMS#02' => [
                        'manHours' => ['p_plan' => 17608, 'p_act' => 11903, 'np_plan' => 3874, 'np_act' => 3333, 'emp' => 59, 'veh' => 7, 'km_p_plan' => 10179, 'km_p_act' => 9940, 'km_np_plan' => 3958, 'km_np_act' => 3865],
                        'leading' => ['peka' => [118, 364], 'hazid' => [930, 1068], 'swa' => [186, 190], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'mwt' => [4, 4], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'kampanye' => [1, 1], 'hygiene_mess' => [1, 2], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#03' => [
                        'manHours' => ['p_plan' => 16616, 'p_act' => 11519, 'np_plan' => 3656, 'np_act' => 3225, 'emp' => 57, 'veh' => 6, 'km_p_plan' => 10179, 'km_p_act' => 7621, 'km_np_plan' => 3958, 'km_np_act' => 2963],
                        'leading' => ['peka' => [114, 272], 'hazid' => [930, 994], 'swa' => [186, 274], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'pra_mcu' => [1, 1], 'top_mwt' => [1, 2], 'mwt' => [4, 6], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'kampanye' => [1, 1], 'hygiene_mess' => [1, 2], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 3]]
                    ],
                    'BMS#08' => [
                        'manHours' => ['p_plan' => 16864, 'p_act' => 14135, 'np_plan' => 3710, 'np_act' => 3958, 'emp' => 57, 'veh' => 5, 'km_p_plan' => 10179, 'km_p_act' => 5468, 'km_np_plan' => 3958, 'km_np_act' => 2126],
                        'leading' => ['peka' => [114, 274], 'hazid' => [930, 1084], 'swa' => [186, 189], 'apd' => [1, 1], 'drops' => [4, 4], 'vv' => [1, 1], 'ivms' => [100, 100], 'pti' => [5, 5], 'top_mwt' => [1, 2], 'mwt' => [4, 5], 'tgm' => [62, 62], 'pre_hitch' => [3, 3], 'phr' => [4, 11], 'st_yard' => [1, 1], 'st_rig' => [1, 1], 'kampanye' => [1, 1], 'hygiene_mess' => [1, 2], 'housekeeping' => [1, 1], 'best_peka' => [1, 1], 'best_driver' => [1, 1], 'onsite' => [3, 3], 'erp_rig' => [3, 4]]
                    ],
                ]
            ];

            $laggingList = [
                ['no' => 1, 'name' => '1.1 FATALITY CASE', 'unit' => 'Case'],
                ['no' => 2, 'name' => '1.2 SERIOUS LOST TIME INJURY (>21 LOST DAYS)', 'unit' => 'Case'],
                ['no' => 3, 'name' => '1.3 RESTRICTED WORK CASE (RWC)', 'unit' => 'Case'],
                ['no' => 4, 'name' => '1.4 MEDICAL TREATMENT CASE (MTC)', 'unit' => 'Case'],
                ['no' => 5, 'name' => '1.5 TOTAL RECORDABLE INJURY (TRI)', 'unit' => 'Case'],
                ['no' => 6, 'name' => '1.6 MOTOR VEHICLE CRASH (MVC)', 'unit' => 'Case'],
                ['no' => 7, 'name' => '1.7 TUMPAHAN MINYAK / OIL SPILL (> 1 bbl)', 'unit' => 'Case'],
                ['no' => 8, 'name' => '1.8 FIRE INCIDENT (> Rp. 100 Jt)', 'unit' => 'Case'],
                ['no' => 9, 'name' => '1.9 PROPERTY DAMAGE (> Rp. 100 Jt)', 'unit' => 'Case'],
                ['no' => 10, 'name' => '1.10 SECURITY CASE', 'unit' => 'Case'],
                ['no' => 11, 'name' => '1.11 ILLNESS / FATALITY', 'unit' => 'Case'],
                ['no' => 12, 'name' => '1.12 REPORTABLE CASE (Nearmiss / FAC / ETA)', 'unit' => 'Case'],
            ];

            $leadingListKeys = [
                'peka' => ['no' => 1, 'name' => 'OBSERVASI PERILAKU (PEKA) *)', 'unit' => 'Laporan'],
                'hazid' => ['no' => 2, 'name' => 'IDENTIFIKASI BAHAYA (HAZID/ 5 MNT RISK ASSESSMENT)', 'unit' => 'Laporan'],
                'swa' => ['no' => 3, 'name' => 'SWA REPORT', 'unit' => 'Laporan'],
                'apd' => ['no' => 4, 'name' => 'INSPEKSI SAFETY EQUIPMENT & APD *) (Eye wash, Shower, Fire, P3K, Tandu, FBH, SCBA)', 'unit' => 'Laporan'],
                'color_code' => ['no' => 5, 'name' => 'EKSTERNAL INSPEKSI LR COLOR CODE', 'unit' => 'Kegiatan'],
                'drops' => ['no' => 6, 'name' => 'INSPEKSI BENDA JATUH / DROPS **)', 'unit' => 'Kegiatan'],
                'vv' => ['no' => 7, 'name' => 'INTERNAL INSPEKSI / V&V OLEH TEAM', 'unit' => 'Laporan'],
                'smk3l' => ['no' => 8, 'name' => 'INSPEKSI / AUDIT SMK3L: PERALATAN, DATA PERSONAL MILIK SUBKONTRAKTOR', 'unit' => 'Kegiatan'],
                'spot' => ['no' => 9, 'name' => 'SPOT CHECK KENDARAAN *) **)', 'unit' => 'Kegiatan'],
                'audit_sys' => ['no' => 10, 'name' => 'AUDIT INTERNAL & EKSTERNAL (Sistem manajemen *)', 'unit' => 'Kegiatan'],
                'ivms' => ['no' => 11, 'name' => 'MONITORING KEPATUHAN PENGEMUDI (Mencakup speed / IVMS report / fatigue *)', 'unit' => '%'],
                'pti' => ['no' => 12, 'name' => 'Laporan Inspeksi Kendaraan (PTI)', 'definition' => '1 laporan / Hari / unit', 'unit' => 'Laporan'],
                'mcu_random' => ['no' => 13, 'name' => 'SPESIFIK MCU RANDOM : NAPZA & MIRAS TEST *)', 'definition' => '1x / semester / kontrak', 'unit' => 'Kegiatan'],
                'mcu_pra_kerja' => ['no' => 14, 'name' => 'Medical Check Up : 1. Pra Pekerjaan (Karyawan Baru)', 'definition' => 'Bilamana ada karyawan baru', 'unit' => 'Kegiatan'],
                'mcu_periodik' => ['no' => 14, 'name' => 'Medical Check Up : 2. Periodik (Tahunan)', 'definition' => '1x/tahun/karyawan', 'unit' => 'Kegiatan'],
                'pra_mcu' => ['no' => 14, 'name' => 'Medical Check Up : 3. Pra MCU (histori konsul pada tahun sebelumnya)', 'definition' => 'Sesuai histori MCU', 'unit' => 'Kegiatan'],
                'top_mwt' => ['no' => 15, 'name' => 'TOP MANAGEMENT VISIT / MWT (Level General Manager / Dir. Operasi / Direktur Utama ***)', 'unit' => 'Kunjungan'],
                'mwt' => ['no' => 16, 'name' => 'MANAGEMENT VISIT / MWT (Level Coord level s/d Manager *)', 'unit' => 'Kunjungan'],
                'tgm' => ['no' => 17, 'name' => 'RAPAT RUTIN KESELAMATAN (TGM PER SHIFT/PJM)', 'unit' => 'Rapat'],
                'pre_hitch' => ['no' => 18, 'name' => 'PRE HITCH MEETING', 'unit' => 'Rapat'],
                'phr' => ['no' => 19, 'name' => 'RAPAT/FORUM BERSAMA LEADER BMS DAN PHR.', 'unit' => 'Rapat'],
                'st_yard' => ['no' => 20, 'name' => 'SAFETY TALK MONTHLY MEETING : 20.1 SUPPORT YARD', 'unit' => 'Rapat'],
                'st_rig' => ['no' => 20, 'name' => 'SAFETY TALK MONTHLY MEETING : 20.2 SUPPORT RIG', 'unit' => 'Rapat'],
                'lead_forum' => ['no' => 21, 'name' => 'LEADERSHIP FORUM ***)', 'unit' => 'Forum'],
                'kampanye' => ['no' => 22, 'name' => 'KAMPANYE KESELAMATAN (PIN/POSTER/STIKER/ SPANDUK) *)', 'unit' => 'Kegiatan'],
                'review_man' => ['no' => 23, 'name' => 'REVIEW, TINJAUAN MANAJEMEN *)', 'unit' => 'Kegiatan'],
                'hygiene_noise' => ['no' => 24, 'name' => 'HYGIENE MONITORING : NOISE & LUX MONITORING **)', 'unit' => 'Kegiatan'],
                'hygiene_mess' => ['no' => 25, 'name' => 'HYGIENE MONITORING : Mess, Catering, DAM*)', 'unit' => 'Kegiatan'],
                'housekeeping' => ['no' => 26, 'name' => 'INSPEKSI "HOUSEKEEPING RIG"', 'unit' => 'Laporan'],
                'kontes_hk' => ['no' => 27, 'name' => 'PENGHARGAAN: KONTES "HOUSEKEEPING RIG" *)', 'unit' => 'Penghargaan'],
                'lh' => ['no' => 28, 'name' => 'PELAPORAN LINGKUNGAN KE DINAS LH', 'unit' => 'Laporan'],
                'rig_month' => ['no' => 29, 'name' => 'PENGHARGAAN: RIG OF THE MONTH INTERNAL / EXTERNAL **)', 'unit' => 'Penghargaan'],
                'best_peka' => ['no' => 30, 'name' => 'PENGHARGAAN THE BEST BBS / PEKA', 'unit' => 'Orang'],
                'best_driver' => ['no' => 31, 'name' => 'PENGHARGAAN THE BEST DRIVER', 'unit' => 'Orang'],
                'kerja_selamat' => ['no' => 32, 'name' => 'PENGHARGAAN: PENCAPAIAN KERJA SELAMAT TAHUNAN', 'unit' => 'Penghargaan'],
                'hes_refreshing' => ['no' => 33, 'name' => 'PENGHARGAAN HES REFRESHING', 'unit' => 'Kegiatan'],
                'onsite' => ['no' => 34, 'name' => '"ON SITE TRAINING" DI LOKASI *)', 'unit' => 'Sesi'],
                'erp_rig' => ['no' => 35, 'name' => 'ERP DRILL RIG : H2S&SCBA / FIRE / MEDIVAC/ PENYELAMATAN KERJA DI KETINGGIAN / TUMPAHAN. **)', 'unit' => 'Drill'],
                'erp_yard' => ['no' => 36, 'name' => 'ERP DRILL YARD : FIRE / MEDIVAC / TUMPAHAN *)', 'unit' => 'Drill'],
            ];

            foreach ($monthlyData as $period => $rigDataMap) {
                foreach ($rigDataMap as $rigNo => $data) {
                    $reportDate = "{$year}-{$period}-01";

                    // Create / update HseReport
                    $report = HseReport::updateOrCreate(
                        [
                            'contract_no' => $contractNo,
                            'rig_no' => $rigNo,
                            'period' => $period,
                            'year' => $year,
                        ],
                        [
                            'report_date' => $reportDate,
                            'location_district' => $location,
                            'work_period' => "Bulan {$period} Tahun {$year}",
                            'status' => 'approved',
                            'submitter_name' => 'Fennielly Dhinawany',
                            'submitter_email' => 'fennielly@besmindo.co.id',
                            'approved_at' => now(),
                        ]
                    );

                    // Insert Man Hours
                    $mh = $data['manHours'];
                    HseManHour::updateOrCreate(
                        ['report_id' => $report->id],
                        [
                            'premises_plan' => $mh['p_plan'],
                            'premises_actual' => $mh['p_act'],
                            'non_premises_plan' => $mh['np_plan'],
                            'non_premises_actual' => $mh['np_act'],
                            'total_employees' => $mh['emp'],
                            'total_vehicles' => $mh['veh'],
                            'kilometer_premises_plan' => $mh['km_p_plan'],
                            'kilometer_premises_actual' => $mh['km_p_act'],
                            'kilometer_non_premises_plan' => $mh['km_np_plan'],
                            'kilometer_non_premises_actual' => $mh['km_np_act'],
                        ]
                    );

                    // Insert Lagging Indicators (all 0 cases)
                    foreach ($laggingList as $lag) {
                        HseLaggingIndicator::updateOrCreate(
                            [
                                'report_id' => $report->id,
                                'indicator_no' => $lag['no'],
                            ],
                            [
                                'indicator_name' => $lag['name'],
                                'unit' => $lag['unit'],
                                'plan' => 0,
                                'actual' => 0,
                                'month' => (int) $period,
                                'year' => $year,
                            ]
                        );
                    }

                    // Insert Leading Indicators
                    $leadValues = $data['leading'];
                    foreach ($leadingListKeys as $key => $info) {
                        $val = $leadValues[$key] ?? [0, 0];
                        HseLeadingIndicator::updateOrCreate(
                            [
                                'report_id' => $report->id,
                                'indicator_no' => $info['no'],
                                'indicator_name' => $info['name'],
                            ],
                            [
                                'unit' => $info['unit'],
                                'definition' => $info['definition'] ?? null,
                                'plan' => $val[0],
                                'actual' => $val[1],
                                'target_month' => $key === 'pti' ? 20 : $val[0],
                                'target_year' => $key === 'pti' ? 240 : $val[0] * 12,
                                'month' => (int) $period,
                                'year' => $year,
                            ]
                        );
                    }
                }
            }
        });
    }
}
