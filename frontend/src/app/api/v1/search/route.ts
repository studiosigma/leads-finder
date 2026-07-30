import { POST as syncPOST } from './sync/route';

export async function POST(req: Request) {
  return syncPOST(req);
}
