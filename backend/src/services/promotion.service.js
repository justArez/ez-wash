function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
export function getAllPromotions(store) {
    return store.promotions;
}
export function createPromotion(store, data) {
    const now = new Date().toISOString();
    const promotion = {
        id: data.id?.trim() ||
            `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        name: data.name?.trim() || "New Promotion",
        description: data.description?.trim() || "",
        applicableTiers: data.applicableTiers ?? [],
        applicableVehicleModels: data.applicableVehicleModels ?? [],
        startDate: data.startDate ?? now.slice(0, 10),
        endDate: data.endDate ?? now.slice(0, 10),
        isActive: data.isActive ?? true,
    };
    store.promotions.push(promotion);
    return promotion;
}
export function updatePromotion(store, promotionId, data) {
    const promotion = store.promotions.find((item) => item.id === promotionId);
    if (!promotion) {
        return null;
    }
    if (data.name !== undefined)
        promotion.name = data.name;
    if (data.description !== undefined)
        promotion.description = data.description;
    if (data.applicableTiers !== undefined)
        promotion.applicableTiers = data.applicableTiers;
    if (data.applicableVehicleModels !== undefined)
        promotion.applicableVehicleModels = data.applicableVehicleModels;
    if (data.startDate !== undefined)
        promotion.startDate = data.startDate;
    if (data.endDate !== undefined)
        promotion.endDate = data.endDate;
    if (data.isActive !== undefined)
        promotion.isActive = data.isActive;
    return promotion;
}
export function deletePromotion(store, promotionId) {
    const index = store.promotions.findIndex((item) => item.id === promotionId);
    if (index === -1) {
        return false;
    }
    store.promotions.splice(index, 1);
    return true;
}
