import { serve } from "https://deno.land/std@0.155.0/http/server.ts";
import * as cheerio from "https://esm.sh/cheerio@1.0.0-rc.12";

function justNumber(node) {
  const match = node.text().trim().match(/[0-9]+/);
  if (match) {
    return parseInt(match[0]);
  } else {
    console.error('Failed to extract number from:', node.html());
    return null;
  }
}

async function handleRequest() {
    const resp = await fetch("https://github.com/wagtail/wagtail/pulse/monthly");
    const contribResp = await fetch(
      "https://github.com/wagtail/wagtail/pulse_diffstat_summary?period=monthly",
    );
    const APIResp = await fetch(
      "https://api.github.com/repos/wagtail/wagtail",
    );
    if (resp.ok && contribResp.ok && APIResp.ok) {
      const html = await resp.text();
      const contribHTML = await contribResp.text();
      const APIJSON = await APIResp.json();
      const $ = cheerio.load(html);
      const $c = cheerio.load(contribHTML);
      const newIssues = justNumber($('a[href="#new-issues"]'));
      const closedIssues = justNumber($('a[href="#closed-issues"]'));
      const openPRs = justNumber($('a[href="#proposed-pull-requests"]'));
      const mergedPRs = justNumber($('a[href="#merged-pull-requests"]'));
      const totalOpenPRs = justNumber(
        $("span[data-content='Pull requests']").next(),
      );
      const totalIssues = justNumber($("span[data-content='Issues']").next());
      const contributors = justNumber(
        $c(".color-fg-default").first(),
        );
        const starcount = APIJSON["stargazers_count"];
      return JSON.stringify({
            new_issues_last_month: newIssues,
            closed_issues_last_month: closedIssues,
            opened_pull_requests_last_month: openPRs,
            merged_pull_requests_last_month: mergedPRs,
            contributors_last_month: contributors,
            total_pull_requests: totalOpenPRs,
            total_issues: totalIssues,
            total_starcount: starcount,
          });
    }
  }

async function handler(req: Request): Promise<Response> {
    const resp = await handleRequest();
    return new Response(resp, {
        status: 200,
        headers: {"content-type": "application/json",},
    });
}    

serve(handler);
