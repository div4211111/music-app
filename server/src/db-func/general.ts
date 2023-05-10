import jsonPatch, { Operation } from 'fast-json-patch';
import { promises as fs } from 'fs';
import path from 'path';

import {
  Band,
  Reservation,
  ShowWithoutAvailableSeatCount,
} from '../../../shared/types';
import { AuthUser } from '../auth';

type JsonDataType =
  | AuthUser
  | Band
  | ShowWithoutAvailableSeatCount
  | Reservation;

const dbPath = 'db';
export enum filenames {
  users = 'users.json',
  bands = 'bands.json',
  shows = 'shows.json',
  reservations = 'reservations.json',
}

export async function getJSONfromFile<ItemType extends JsonDataType>(
  filename: filenames,
): Promise<ItemType[]> {
  const filePath = path.join(dbPath, filename);
  const data = await fs.readFile(filePath);
  return JSON.parse(data.toString());
}

export async function getItemById<ItemType extends JsonDataType>(
  itemId: number,
  filename: filenames,
  itemType: string,
): Promise<ItemType> {
  const items = await getJSONfromFile<ItemType>(filename);
  const itemData = items.filter((u: ItemType) => u.id === itemId);
  if (itemData.length < 1) throw new Error(`${itemType} not found`);
  if (itemData.length > 1) throw new Error(`duplicate ${itemType} found`);
  return itemData[0];
}

export async function writeJSONToFile<T extends JsonDataType>(
  filename: filenames,
  data: Array<T>,
): Promise<void> {
  const filePath = path.join(dbPath, filename);
  const jsonData = JSON.stringify(data);
  await fs.writeFile(filePath, jsonData, { flag: 'w' });
}

export async function deleteItem<T extends JsonDataType>(
  filename: filenames,
  itemId: number,
): Promise<number> {
  try {
    const items = await getJSONfromFile<T>(filename);
    const foundItemArray = items.filter((i) => i.id === itemId);
    if (foundItemArray.length !== 1) {
      throw new Error(`Could not find item id ${itemId} in ${filename}`);
    }
    const updatedItems = items.filter((i) => i.id !== itemId);
    await writeJSONToFile(filename, updatedItems);
    return itemId;
  } catch (e) {
    throw new Error(
      `Could not delete item id ${itemId} from ${filename}: ${e}`,
    );
  }
}

const { applyPatch } = jsonPatch;

export async function updateItem<DataType extends JsonDataType>(
  itemId: number,
  filename: filenames,
  itemPatch: Operation[],
): Promise<DataType> {
  try {
    const items = await getJSONfromFile<DataType>(filename);

    const foundItems = items.filter((item) => item.id === itemId);
    if (foundItems.length !== 1) {
      throw new Error(`Could not find item with id ${itemId}`);
    }

    const updatedData = applyPatch(foundItems[0], itemPatch).newDocument;

    items.forEach((item, i) => {
      if (item.id === itemId) {
        items[i] = updatedData;
      }
    });

    await writeJSONToFile(filename, items);
    return updatedData;
  } catch (e) {
    throw new Error(
      `Could not delete item id ${itemId} from ${filename}: ${e}`,
    );
  }
}
