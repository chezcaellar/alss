import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const modules = await db.collection("modules").find({}).toArray();
    return NextResponse.json(modules);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ success: false, error: "Failed to fetch modules" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const moduleData = await req.json();

    // Validate required fields
    if (!moduleData.title || !moduleData.title.trim()) {
      return NextResponse.json(
        { success: false, error: "Module title is required" },
        { status: 400 }
      );
    }

    if (!moduleData.levels || !Array.isArray(moduleData.levels) || moduleData.levels.length === 0) {
      return NextResponse.json(
        { success: false, error: "At least one program level is required" },
        { status: 400 }
      );
    }

    // Validate predefinedActivities if provided
    if (moduleData.predefinedActivities && Array.isArray(moduleData.predefinedActivities)) {
      for (const activity of moduleData.predefinedActivities) {
        if (!activity.name || !activity.type || !activity.total) {
          return NextResponse.json(
            { success: false, error: "Each activity must have name, type, and total points" },
            { status: 400 }
          );
        }
      }
    }

    // Insert the new module into the database
    const result = await db.collection("modules").insertOne({
      title: moduleData.title.trim(),
      levels: moduleData.levels,
      predefinedActivities: moduleData.predefinedActivities || [],
    });

    return NextResponse.json({ 
      success: true, 
      data: {
        _id: result.insertedId.toString(),
        ...moduleData
      }
    });
  } catch (error: any) {
    console.error("Error inserting module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create module" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const moduleData = await req.json();

    const { _id, title, levels, predefinedActivities } = moduleData || {};

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Module ID is required" },
        { status: 400 }
      );
    }

    if (title && !title.trim()) {
      return NextResponse.json(
        { success: false, error: "Module title cannot be empty" },
        { status: 400 }
      );
    }

    if (levels && (!Array.isArray(levels) || levels.length === 0)) {
      return NextResponse.json(
        { success: false, error: "Levels must contain at least one entry" },
        { status: 400 }
      );
    }

    if (predefinedActivities && Array.isArray(predefinedActivities)) {
      for (const activity of predefinedActivities) {
        if (!activity.name || !activity.type || !activity.total) {
          return NextResponse.json(
            { success: false, error: "Each activity must have name, type, and total points" },
            { status: 400 }
          );
        }
      }
    }

    const isObjectId = ObjectId.isValid(_id);
    const filter = { _id: isObjectId ? new ObjectId(_id) : _id };

    const updatePayload: Record<string, unknown> = {};
    if (title !== undefined) {
      updatePayload.title = title.trim();
    }
    if (levels !== undefined) {
      updatePayload.levels = levels;
    }
    if (predefinedActivities !== undefined) {
      updatePayload.predefinedActivities = predefinedActivities;
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json(
        { success: false, error: "No fields provided to update" },
        { status: 400 }
      );
    }

    const result = await db.collection("modules").findOneAndUpdate(
      filter,
      { $set: updatePayload },
      { returnDocument: "after", upsert: true }
    );

    // Handle potential null result
    if (!result) {
      return NextResponse.json(
        { success: false, error: "Failed to update module - no result returned" },
        { status: 500 }
      );
    }

    const updatedDocument = result.value ?? {
      _id: result.lastErrorObject?.upserted || filter._id,
      ...updatePayload,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...updatedDocument,
        _id: updatedDocument._id?.toString?.() ?? updatedDocument._id,
      }
    });
  } catch (error) {
    console.error("Error updating module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to update module" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const client = await clientPromise;
    const db = client.db("main");
    const body = await req.json();
    const { _id } = body || {};

    if (!_id) {
      return NextResponse.json(
        { success: false, error: "Module ID is required" },
        { status: 400 }
      );
    }

    const isObjectId = ObjectId.isValid(_id);
    const filter = { _id: isObjectId ? new ObjectId(_id) : _id };

    const result = await db.collection("modules").deleteOne(filter);

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting module:", error);
    return NextResponse.json(
      { success: false, error: "Failed to delete module" },
      { status: 500 }
    );
  }
}