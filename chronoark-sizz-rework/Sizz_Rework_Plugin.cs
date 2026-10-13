using System.Collections.Generic;
using System.IO;
using ChronoArkMod;
using ChronoArkMod.Plugin;
using ChronoArkMod.ModData.Settings;
using GameDataEditor;
using Newtonsoft.Json;
using UnityEngine;

namespace Sizz_Rework
{
    public class SizzReworkPlugin : ChronoArkPlugin
    {
        public override void Initialize()
        {
            EnsureModeSetting();
            string addDirectory = Path.Combine(ModManager.getModInfo(ModId).DirectoryName, "gdata", "Add");
            RegisterSizzBattlePrefabAlias();
            Dictionary<string, object> copies = new Dictionary<string, object>();
            string[] sourceKeys = { "S_Sizz_0", "S_Sizz_1", "S_Sizz_2", "S_Sizz_3", "S_Sizz_4", "S_Sizz_5", "S_Sizz_6", "S_Sizz_7", "S_Sizz_10", "S_Sizz_11", "S_Sizz_12", "S_Sizz_13" };
            foreach (string sourceKey in sourceKeys)
            {
                Dictionary<string, object> source;
                if (GDEDataManager.Get(sourceKey, out source))
                {
                    copies["Sizz_Rework_" + sourceKey] = new Dictionary<string, object>(source);
                }
            }

            if (copies.Count > 0)
            {
                Directory.CreateDirectory(addDirectory);
                string skillsPath = Path.Combine(addDirectory, "Sizz_Rework_Skills.json");
                if (!File.Exists(skillsPath))
                {
                    File.WriteAllText(skillsPath, JsonConvert.SerializeObject(copies, Formatting.Indented));
                }
            }

            Dictionary<string, object> originalCharacter;
            if (GDEDataManager.Get(GDEItemKeys.Character_Sizz, out originalCharacter))
            {
                Dictionary<string, object> reworkCharacter = new Dictionary<string, object>(originalCharacter);
                reworkCharacter["KeyID"] = "Sizz_Rework_Sizz";
                reworkCharacter["name"] = "시즈 리워크";
                reworkCharacter["PassiveClassName"] = typeof(P_SizzRework).AssemblyQualifiedName;
                reworkCharacter["PassiveUnlockLV1"] = true;

                Dictionary<string, object> characterEntry = new Dictionary<string, object>();
                characterEntry["Sizz_Rework_Sizz"] = reworkCharacter;
                Directory.CreateDirectory(addDirectory);
                string characterPath = Path.Combine(addDirectory, "Sizz_Rework_Character.json");
                if (!File.Exists(characterPath))
                {
                    File.WriteAllText(characterPath, JsonConvert.SerializeObject(characterEntry, Formatting.Indented));
                }
            }

            Dictionary<string, object> originalEve;
            if (GDEDataManager.Get(GDEItemKeys.Buff_P_Sizz_0, out originalEve))
            {
                Dictionary<string, object> reworkEve = new Dictionary<string, object>(originalEve);
                reworkEve["KeyID"] = "B_SizzRework_Eve";
                reworkEve["ClassName"] = typeof(B_SizzReworkEve).AssemblyQualifiedName;

                Dictionary<string, object> eveEntry = new Dictionary<string, object>();
                eveEntry["B_SizzRework_Eve"] = reworkEve;
                string evePath = Path.Combine(addDirectory, "Sizz_Rework_Eve.json");
                if (!File.Exists(evePath))
                {
                    File.WriteAllText(evePath, JsonConvert.SerializeObject(eveEntry, Formatting.Indented));
                }
            }

            Dictionary<string, object> utilitySkills = new Dictionary<string, object>();
            utilitySkills["S_SizzRework_MoveEve"] = CreateUtilitySkill("S_SizzRework_MoveEve", "이브 이동", "턴 시작 시 이브를 자신 또는 대상 아군에게 이동시킵니다.", false);
            utilitySkills["S_SizzRework_BorrowSkill"] = CreateUtilitySkill("S_SizzRework_BorrowSkill", "공용 전술 배치", "대상 아군이 사용할 수 있는 모든 스킬(희귀 스킬 포함) 중 하나를 선택해 손으로 가져옵니다. 사용 후 이 카드는 손으로 돌아옵니다.", true);
            string utilityPath = Path.Combine(addDirectory, "Sizz_Rework_UtilitySkills.json");
            // 모드 에디터의 핫 세이브 결과를 다음 로드에서 덮어쓰지 않습니다.
            if (!File.Exists(utilityPath))
            {
                File.WriteAllText(utilityPath, JsonConvert.SerializeObject(utilitySkills, Formatting.Indented));
            }
        }

        private void RegisterSizzBattlePrefabAlias()
        {
            GameObject originalSizz = AddressableLoadManager.LoadAddressableAsset<GameObject>(GDEItemKeys.Character_Sizz);
            if (originalSizz != null)
            {
                ModManager.getModInfo(ModId).assetInfo.IDtoObject["Sizz_Rework_Sizz"] = originalSizz;
            }
        }

        private void EnsureModeSetting()
        {
            foreach (SettingEntry entry in ModManager.getModInfo(ModId).ModSettingEntries)
            {
                if (entry.Key == SizzReworkMode.OriginalSizzToggleKey)
                {
                    return;
                }
            }

            ToggleSetting setting = new ToggleSetting(
                SizzReworkMode.OriginalSizzToggleKey,
                "원본 시즈 리워크 사용",
                "새로 영입하는 원본 시즈에 리워크 패시브와 스킬을 적용합니다. 기존에 영입한 시즈는 변경되지 않습니다.",
                false,
                ModId);
            ChronoArkMod.ModData.ModInfo modInfo = ModManager.getModInfo(ModId);
            setting.RestoreFromModSettings(modInfo.settings);
            modInfo.ModSettingEntries.Add(setting);
        }

        private static Dictionary<string, object> CreateUtilitySkill(string key, string name, string description, bool notCount)
        {
            Dictionary<string, object> skill = new Dictionary<string, object>();
            skill["_gdeSchema"] = "Skill";
            skill["KeyID"] = key;
            skill["Name"] = name;
            skill["Description"] = description;
            skill["User"] = "Sizz_Rework_Sizz";
            skill["Target"] = "ally";
            skill["UseAp"] = 0;
            skill["HealSkill"] = true;
            skill["NoDrop"] = true;
            skill["NotCount"] = notCount;
            skill["Disposable"] = true;
            skill["Particle"] = "Particle/Buff";
            return skill;
        }
        public override void Dispose() { }
    }

    public static class SizzReworkMode
    {
        public const string OriginalSizzToggleKey = "use_rework_on_original_sizz";

        public static bool UseOriginalSizzRework()
        {
            ToggleSetting setting = ModManager.getModInfo("Sizz_Rework").GetSetting<ToggleSetting>(OriginalSizzToggleKey);
            return setting != null && setting.Value;
        }
    }
}
