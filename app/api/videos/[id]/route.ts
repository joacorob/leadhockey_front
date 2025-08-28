import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import { getServerSession } from "next-auth"

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const session = await getServerSession(authOptions)
    const accessToken: string | undefined = (session as any)?.accessToken

    const externalResponse = await fetch(`${process.env.LEAD_BACKEND}/api/v1/videos/${params.id}`, {
      headers: {
        accept: "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
    })

    console.log(JSON.stringify(externalResponse, null, 2))

    const data = await externalResponse.json()

    console.log(JSON.stringify(data, null, 2))

    // real example data:
  //   {
  //     "data" : {
  //        "avgRating" : 0,
  //        "categoryId" : 1,
  //        "club_id" : null,
  //        "createdAt" : "2025-07-04T15:26:52.000Z",
  //        "createdBy" : "admin_mock_id",
  //        "description" : "Test",
  //        "duration" : 24,
  //        "fileSize" : 576002,
  //        "filterOptionIds" : [],
  //        "id" : 1,
  //        "isPublished" : 0,
  //        "likes" : 0,
  //        "pdfs" : [
  //           {
  //              "id" : 1,
  //              "name" : "NL_Skills 18.pdf",
  //              "size" : 488409,
  //              "uploadedAt" : "2025-07-04T15:26:52.000Z",
  //              "url" : "https://leadhockey.ams3.digitaloceanspaces.com/sessions/documents/1751650010177-NL_Skills 18.pdf"
  //           }
  //        ],
  //        "resolution" : "1920x1080",
  //        "subtitles" : [],
  //        "tagIds" : [],
  //        "thumbnail" : "https://leadhockey.ams3.digitaloceanspaces.com/sessions/thumbnails/1751650011273-thumbnail.jpg",
  //        "title" : "Test",
  //        "totalRatings" : 0,
  //        "updatedAt" : "2025-07-04T15:26:52.000Z",
  //        "videoUrl" : "https://leadhockey.ams3.digitaloceanspaces.com/sessions/videos/1751650006206-Skills 18.mp4",
  //        "views" : 0
  //     },
  //     "success" : true
  //  }

    if (externalResponse.ok) {
      return NextResponse.json({ success: true, data: data.data ?? data })
    }

    return NextResponse.json({ success: false, error: data?.message || "Failed to fetch video" }, { status: externalResponse.status })
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message, "error")
    } else {
      console.error("Unknown error", error)
    }
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 })
  }
}

// If you need PUT/UPDATE, forward similarly to the backend API.
