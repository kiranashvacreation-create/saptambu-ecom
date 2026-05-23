import type { MediaArticle } from "@/generated/prisma/client";
import { archiveMediaArticleAction, deleteMediaArticleAction, saveMediaArticleAction } from "@/app/admin/actions";
import { Field, inputClass, textareaClass } from "@/components/admin-field";
import { AutoSlugFormController } from "@/components/auto-slug-form-controller";
import { ConfirmSubmitButton } from "@/components/confirm-submit-button";
import { ImageUploadField } from "@/components/image-upload-field";
import { RichTextEditor } from "@/components/rich-text-editor";

function dateTimeLocal(value?: Date | null) {
  if (!value) return "";
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function MediaArticleForm({ article }: { article?: MediaArticle }) {
  return (
    <form action={saveMediaArticleAction} className="grid gap-6 lg:grid-cols-[1fr_340px]">
      <AutoSlugFormController />
      <input type="hidden" name="id" value={article?.id || ""} />
      <div className="grid gap-5 rounded-lg border border-[var(--border)] bg-white p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title">
            <input name="title" required defaultValue={article?.title || ""} className={inputClass} />
          </Field>
          <Field label="Status">
            <select name="status" defaultValue={article?.status || "DRAFT"} className={inputClass}>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
              <option value="ARCHIVED">ARCHIVED</option>
            </select>
          </Field>
        </div>
        <Field label="Slug">
          <input name="slug" defaultValue={article?.slug || ""} className={inputClass} />
        </Field>
        <Field label="Excerpt">
          <textarea name="excerpt" rows={3} defaultValue={article?.excerpt || ""} className={textareaClass} />
        </Field>
        <Field label="Body">
          <RichTextEditor name="bodyHtml" defaultValue={article?.bodyHtml || ""} />
        </Field>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Source name">
            <input name="sourceName" defaultValue={article?.sourceName || ""} className={inputClass} />
          </Field>
          <Field label="Source URL">
            <input name="sourceUrl" type="url" defaultValue={article?.sourceUrl || ""} className={inputClass} />
          </Field>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Published at">
            <input name="publishedAt" type="datetime-local" defaultValue={dateTimeLocal(article?.publishedAt)} className={inputClass} />
          </Field>
          <Field label="Sort order">
            <input name="sortOrder" type="number" defaultValue={article?.sortOrder ?? 0} className={inputClass} />
          </Field>
        </div>
        <button className="focus-ring h-11 rounded-md bg-[#1c6d62] px-5 font-semibold text-white">Save media article</button>
      </div>

      <aside className="grid h-fit gap-5 rounded-lg border border-[var(--border)] bg-white p-5">
        <h2 className="text-xl font-semibold">Cover image</h2>
        <Field label="Cover image URL">
          <ImageUploadField defaultValue={article?.coverImageUrl || ""} folder="media" multiple={false} name="coverImageUrl" />
        </Field>
        <Field label="Cover image alt text">
          <input name="coverImageAlt" defaultValue={article?.coverImageAlt || ""} className={inputClass} />
        </Field>
        <p className="text-sm text-[#6d5f52]">
          Paste a URL or upload to Cloudinary. The image appears on the media coverage page and article detail page.
        </p>
        {article ? (
          <div className="grid gap-3 rounded-md border border-red-200 bg-red-50 p-3">
            <button formAction={archiveMediaArticleAction} className="focus-ring h-10 rounded-md bg-[#9b2f22] px-4 text-sm font-semibold text-white">
              Archive article
            </button>
            <ConfirmSubmitButton
              className="focus-ring h-10 rounded-md bg-red-700 px-4 text-sm font-semibold text-white"
              confirmMessage={`Permanently delete "${article.title}"?`}
              formAction={deleteMediaArticleAction}
            >
              Delete article
            </ConfirmSubmitButton>
          </div>
        ) : null}
      </aside>
    </form>
  );
}
