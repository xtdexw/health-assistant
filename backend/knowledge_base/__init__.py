"""
健康知识库示例
"""
NUTRITION_KNOWLEDGE = [
    {
        "content": "成年人每天应摄入谷类食物250-400克，其中全谷物和杂豆类50-150克，薯类50-100克。",
        "category": "nutrition",
        "source": "中国居民膳食指南"
    },
    {
        "content": "建议餐餐有蔬菜，保证每天摄入300-500克蔬菜，深色蔬菜应占一半。",
        "category": "nutrition",
        "source": "中国居民膳食指南"
    },
    {
        "content": "每天保证摄入200-350克新鲜水果，果汁不能代替鲜果。",
        "category": "nutrition",
        "source": "中国居民膳食指南"
    },
    {
        "content": "每天摄入动物性食物120-200克，其中鱼类40-75克，畜禽肉40-75克，蛋类40-50克。",
        "category": "nutrition",
        "source": "中国居民膳食指南"
    },
    {
        "content": "成年人每天饮水7-8杯（1500-1700毫升），提倡饮用白开水或茶水，不喝或少喝含糖饮料。",
        "category": "nutrition",
        "source": "中国居民膳食指南"
    },
]

FITNESS_KNOWLEDGE = [
    {
        "content": "世界卫生组织建议成年人每周至少进行150分钟中等强度有氧运动，或75分钟高强度有氧运动。",
        "category": "fitness",
        "source": "WHO运动指南"
    },
    {
        "content": "运动前应进行5-10分钟热身，运动后进行5-10分钟拉伸，可以有效预防运动损伤。",
        "category": "fitness",
        "source": "运动科学"
    },
    {
        "content": "对于初学者，建议每周运动3-4次，每次30-45分钟，逐步增加运动强度和时间。",
        "category": "fitness",
        "source": "健身指导"
    },
    {
        "content": "力量训练每周建议2-3次，每次针对不同肌群，间隔至少48小时休息。",
        "category": "fitness",
        "source": "健身科学"
    },
]

SUB_HEALTH_KNOWLEDGE = [
    {
        "content": "亚健康状态的特征包括：疲劳乏力、失眠多梦、情绪不稳、记忆力下降、免疫力降低等。",
        "category": "sub_health",
        "source": "中医健康管理"
    },
    {
        "content": "改善亚健康建议：保证充足睡眠（每天7-8小时）、规律运动、均衡饮食、保持良好心态。",
        "category": "sub_health",
        "source": "健康指导"
    },
    {
        "content": "中医调理亚健康的方法包括：针灸、推拿、中药调理、食疗、运动导引等。",
        "category": "sub_health",
        "source": "中医理论"
    },
    {
        "content": "办公室常见亚健康问题：颈肩腰腿痛、眼疲劳、精神压力大。建议每小时起身活动5分钟。",
        "category": "sub_health",
        "source": "职业健康"
    },
]

GENERAL_HEALTH_KNOWLEDGE = [
    {
        "content": "成年人正常血压范围为收缩压90-140mmHg，舒张压60-90mmHg。",
        "category": "general",
        "source": "医学常识"
    },
    {
        "content": "成年人正常心率范围为60-100次/分钟，运动员可能更低。",
        "category": "general",
        "source": "医学常识"
    },
    {
        "content": "正常体温范围为36.0-37.0℃，不同测量部位略有差异。",
        "category": "general",
        "source": "医学常识"
    },
    {
        "content": "建议每年进行一次全面体检，及时发现潜在健康问题。",
        "category": "general",
        "source": "健康管理"
    },
]

# 合并所有知识库
ALL_KNOWLEDGE = (
    NUTRITION_KNOWLEDGE +
    FITNESS_KNOWLEDGE +
    SUB_HEALTH_KNOWLEDGE +
    GENERAL_HEALTH_KNOWLEDGE
)
