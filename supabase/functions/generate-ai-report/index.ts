
import { serve } from "std/http/server.ts"
import { createClient } from "supabase-js"
import { corsHeaders, handleCors } from "../_shared/cors.ts"
import "xhr"

const supabaseUrl = Deno.env.get('SUPABASE_URL') as string
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
const openAiApiKey = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req)
  if (corsResponse) return corsResponse

  try {
    console.log("AI Report Generation function starting")
    
    // Parse request body
    const { requestId, prompt } = await req.json()
    console.log(`Processing request ID: ${requestId}, prompt: "${prompt}"`)
    
    if (!requestId) {
      console.error("Missing requestId in request body")
      return new Response(
        JSON.stringify({ error: "Missing requestId in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    if (!openAiApiKey) {
      console.error("OPENAI_API_KEY is not set in the environment variables")
      return new Response(
        JSON.stringify({ error: "OpenAI API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log("Supabase client initialized")
    
    // Get the request details from the database
    const { data: requestData, error: requestError } = await supabase
      .from("ai_report_requests")
      .select("*")
      .eq("id", requestId)
      .single()
      
    if (requestError || !requestData) {
      console.error("Error fetching request data:", requestError)
      return new Response(
        JSON.stringify({ error: "Request not found", details: requestError }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    console.log("Request data retrieved:", requestData.id)
    
    // Update status to processing
    const { error: updateError } = await supabase
      .from("ai_report_requests")
      .update({ status: "processing" })
      .eq("id", requestId)
      
    if (updateError) {
      console.error("Error updating request status:", updateError)
      return new Response(
        JSON.stringify({ error: "Failed to update request status", details: updateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    console.log("Request status updated to processing")
    
    // Generate report template with OpenAI
    console.log("Calling OpenAI API...")
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are an expert ESG reporting AI. You create detailed, professional ESG (Environmental, Social, and Governance) reports 
            based on provided instructions. Structure your responses as JSON that can be used to generate a report template.`
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      })
    })
    
    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text()
      console.error("OpenAI API Error:", errorText)
      await supabase
        .from("ai_report_requests")
        .update({ 
          status: "failed",
          error_message: `OpenAI error: ${errorText}`
        })
        .eq("id", requestId)
      
      return new Response(
        JSON.stringify({ error: "Failed to generate report with OpenAI", details: errorText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    const openAIData = await openAIResponse.json()
    console.log("Received response from OpenAI")
    
    const reportContent = JSON.parse(openAIData.choices[0].message.content)
    
    // Create a template
    const { data: templateData, error: templateError } = await supabase
      .from("report_templates")
      .insert({
        business_id: requestData.business_id,
        name: reportContent.title || "AI Generated Report",
        description: reportContent.description || prompt.substring(0, 200),
        layout_type: "infographic",
        report_type: "combined",
        ai_generated: true,
        ai_prompt: prompt,
        theme_colors: reportContent.theme_colors || ["#10B981", "#3B82F6", "#8B5CF6"],
        visualization_config: reportContent.visualization || {
          showBarCharts: true,
          showLineCharts: true,
          showPieCharts: true,
          showTables: true,
          showTimeline: true
        },
        charts_config: reportContent.charts || [],
        config: reportContent.config || {}
      })
      .select()
      .single()
      
    if (templateError) {
      console.error("Error creating template:", templateError)
      await supabase
        .from("ai_report_requests")
        .update({ 
          status: "failed",
          error_message: `Template creation error: ${templateError.message}`
        })
        .eq("id", requestId)
      
      return new Response(
        JSON.stringify({ error: "Failed to create report template", details: templateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    console.log("Template created successfully:", templateData.id)
    
    // Update the request with the generated template
    const { error: finalUpdateError } = await supabase
      .from("ai_report_requests")
      .update({ 
        status: "completed",
        template_id: templateData.id,
        generated_config: reportContent
      })
      .eq("id", requestId)
    
    if (finalUpdateError) {
      console.error("Error updating request with completion status:", finalUpdateError)
      return new Response(
        JSON.stringify({ error: "Failed to update request completion status", details: finalUpdateError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }
    
    console.log("AI Report generation completed successfully")
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        requestId: requestId, 
        templateId: templateData.id
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
    
  } catch (error) {
    console.error("Unexpected error in generate-ai-report function:", error)
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
