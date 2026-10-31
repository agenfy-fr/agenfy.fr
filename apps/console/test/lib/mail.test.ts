import { describe, expect, it } from "vitest";
import {
  attachmentContentType,
  contentDisposition,
  folderLabel,
  forwardSubject,
  mailBodyCsp,
  parseAddressList,
  quoteForReply,
  renderMailDocument,
  replyAllRecipients,
  replySubject,
  sortFolders,
} from "@/lib/mail";

describe("subjects", () => {
  it("prefixes once", () => {
    expect(replySubject("Devis")).toBe("Re: Devis");
    expect(replySubject("RE: Re: Devis")).toBe("Re: Devis");
    expect(forwardSubject("Fwd: TR: Devis")).toBe("Tr: Devis");
    expect(replySubject(null)).toBe("Re:");
  });
});

describe("parseAddressList", () => {
  it("parses names and separators", () => {
    expect(parseAddressList('Jean Dupont <jean@x.fr>, marie@y.fr; "Paul" <paul@z.fr>')).toEqual([
      { name: "Jean Dupont", address: "jean@x.fr" },
      { name: null, address: "marie@y.fr" },
      { name: "Paul", address: "paul@z.fr" },
    ]);
  });
  it("rejects any invalid entry", () => {
    expect(parseAddressList("jean@x.fr, pas-une-adresse")).toBeNull();
    expect(parseAddressList("")).toEqual([]);
  });
});

describe("folders", () => {
  it("orders inbox and special folders first", () => {
    const sorted = sortFolders([
      { path: "INBOX.Trash", name: "Trash", specialUse: "\\Trash" },
      { path: "Clients", name: "Clients", specialUse: null },
      { path: "INBOX.Sent", name: "Sent", specialUse: "\\Sent" },
      { path: "INBOX", name: "INBOX", specialUse: null },
    ]);
    expect(sorted.map((f) => f.path)).toEqual(["INBOX", "INBOX.Sent", "INBOX.Trash", "Clients"]);
    expect(folderLabel(sorted[0]!)).toBe("Boîte de réception");
    expect(folderLabel(sorted[1]!)).toBe("Envoyés");
  });
});

describe("replies", () => {
  it("reply-all excludes our own address and duplicates", () => {
    const r = replyAllRecipients("contact@agenfy.fr", {
      from: [{ name: "A", address: "a@x.fr" }],
      replyTo: [],
      to: [{ name: null, address: "CONTACT@agenfy.fr" }, { name: null, address: "b@x.fr" }],
      cc: [{ name: null, address: "a@x.fr" }, { name: null, address: "c@x.fr" }],
    });
    expect(r.to.map((a) => a.address)).toEqual(["a@x.fr"]);
    expect(r.cc.map((a) => a.address)).toEqual(["b@x.fr", "c@x.fr"]);
  });
  it("quotes the original text", () => {
    const q = quoteForReply({ from: "a@x.fr", date: null, text: "Bonjour\n> avant" });
    expect(q).toContain("a@x.fr a écrit :");
    expect(q).toContain("> Bonjour\n>> avant");
  });
});

describe("body rendering", () => {
  it("escapes plain text and inlines cid images", () => {
    const doc = renderMailDocument(null, "<script>alert(1)</script>");
    expect(doc).toContain("&lt;script&gt;");
    expect(doc).not.toContain("<script>");
    const html = renderMailDocument('<img src="cid:logo1">', "", [{ cid: "logo1", contentType: "image/png", base64: "AAAA" }]);
    expect(html).toContain('src="data:image/png;base64,AAAA"');
  });
  it("sandboxes the document and blocks remote images by default", () => {
    expect(mailBodyCsp(false)).toContain("sandbox allow-popups");
    expect(mailBodyCsp(false)).toContain("img-src data:;");
    expect(mailBodyCsp(false)).not.toContain("script-src");
    expect(mailBodyCsp(true)).toContain("img-src data: https: http:");
  });
  it("never serves attachments as active content", () => {
    expect(attachmentContentType("text/html")).toBe("application/octet-stream");
    expect(attachmentContentType("image/svg+xml")).toBe("application/octet-stream");
    expect(attachmentContentType("application/pdf")).toBe("application/pdf");
    expect(contentDisposition('Facture "été".pdf')).toBe(
      `attachment; filename="Facture __t__.pdf"; filename*=UTF-8''Facture%20%22%C3%A9t%C3%A9%22.pdf`,
    );
  });
});
