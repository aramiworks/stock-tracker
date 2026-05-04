import { Injectable } from "@nestjs/common";
import { TRPCError } from "@trpc/server";
import { TrackerCatalogBrowseModels } from "../models/index.js";

type UnitWithSkus = NonNullable<
  Awaited<ReturnType<TrackerCatalogBrowseModels["findById"]>>
>;

const mapSku = (s: UnitWithSkus["skus"][number]) => ({
  id: s.id,
  color: s.color,
  leather: s.leather,
  hardware: s.hardware,
  size: s.size,
  referenceCode: s.reference_code,
  imageUrl: s.image_url,
  active: s.active,
});

const mapUnit = (u: UnitWithSkus) => ({
  id: u.id,
  brand: u.brand,
  productLine: u.product_line,
  modelName: u.model_name,
  imageUrl: u.image_url,
  active: u.active,
  createdAt: u.created_at,
  updatedAt: u.updated_at,
  skus: u.skus.map(mapSku),
});

@Injectable()
export class TrackerCatalogBrowseControllers {
  constructor(private readonly models: TrackerCatalogBrowseModels) {}

  async list(input: {
    productLine?: string;
    search?: string;
    activeOnly: boolean;
  }) {
    const units = await this.models.findAll(input);
    return units.map(mapUnit);
  }

  async byId(input: { id: string }) {
    const unit = await this.models.findById(input.id);
    if (!unit) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: `WatchableUnit ${input.id} not found`,
      });
    }
    return mapUnit(unit);
  }
}
