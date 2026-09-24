// Sharecam host dashboard — English, the typed source (plan §3.6, D15).
//
// The other eight languages (WP-H) are files next to this one — tr.ts es.ts de.ts
// fr.ts it.ts pt.ts nl.ts pl.ts — each:
//     import type { Dict } from './en';
//     const tr: Dict = { … every key below … };
//     export default tr;
// `Dict = Record<Key, string>`, so tsc fails on a missing or stale key.
//
// Wording order (plan §3.6): the app's locale files first — a `// app: <key>`
// comment names the source key in EC/src/i18n/locales/<lang>.ts, where the
// native-reviewed translation (23 Sep 2026, EC 5c05c8e) already exists: copy it
// verbatim (the app writes {{x}}, this file writes {x}). Keys without the comment
// are new dashboard strings (EN drafted here; TR drafted by WP-H, checked by Berk;
// the other seven get a native check before go-live).
// Placeholders: {name} {n} {date} {plan} {price} {email} {time} {code} {v} … —
// keep them. Plan names (Spark, Party, Wedding, Unlimited, Pro 500…) are brand
// names: never translated. Pages the app opens get no web-purchase wording (D20):
// these strings appear only on /host.

export const en = {
  // ---------------------------------------------------------------- common
  'common.back': 'Back',
  'common.cancel': 'Cancel', // app: common.cancel
  'common.close': 'Close', // app: common.close
  'common.delete': 'Delete', // app: common.delete
  'common.on': 'On', // app: common.on
  'common.off': 'Off', // app: common.off
  'common.ok': 'OK',
  'common.copy': 'Copy',
  'common.copied': 'Copied', // app: face.noticeCopied
  'common.remove': 'Remove', // app: create.coverRemove
  'common.saving': 'Saving…',
  'common.loading': 'Loading…',
  'common.loadFailed': 'This page could not be loaded',
  'common.checkConnection': 'Check your connection and try again.',
  'common.tryAgain': 'Something went wrong. Please try again.',
  'common.prev': 'Previous',
  'common.next': 'Next',

  // ---------------------------------------------------------------- page titles (browser tab)
  'title.events': 'Your events',
  'title.signin': 'Sign in',
  'title.new': 'Create your event',
  'title.account': 'Account',

  // ---------------------------------------------------------------- shell
  'shell.tag': 'Host',
  'shell.language': 'Language',
  'shell.accountMenu': 'Account menu',
  'shell.events': 'Your events',
  'shell.account': 'Account',
  'shell.signOut': 'Sign out', // app: account.signOut
  'shell.signedInAs': 'Signed in as {who}',
  'shell.paired': 'Paired with the app',
  'shell.pairedLong': 'This computer is paired with the Sharecam app. It has no sign-in of its own yet.',
  'shell.linkBannerTitle': 'Add a sign-in to keep this account',
  'shell.linkBannerBody': 'This computer is paired with your Sharecam app. Add an email or Google sign-in so you can come back without the app. You need one to buy a package on the web.',
  'shell.linkBannerCta': 'Add a sign-in',
  'nav.events': 'Your events',
  'nav.signin': 'Sign in',
  'legal.webTerms': 'Web purchase terms',
  'legal.refund': 'Refund policy',
  'legal.privacy': 'Privacy', // app: legal.privacy
  'legal.terms': 'Terms', // app: legal.terms
  'legal.support': 'Support', // app: legal.support
  'legacy.title': 'Pair this computer again',
  'legacy.body': 'This browser was connected to your events by the old upload page. We signed it out so the guest page here works normally again. To upload, pair it once more with the Sharecam app or sign in.',

  // ---------------------------------------------------------------- sign in
  'signin.kicker': 'Host dashboard',
  'signin.title': 'Sign in to your events',
  'signin.lead': 'Your events, guests and photos in one place — on any computer or phone.',
  'signin.newTitle': 'New to Sharecam?',
  'signin.newCta': 'Create your event — no app needed',
  'signin.appKicker': 'Already using the app?',
  'signin.appTitle': 'Same account, same events',
  'signin.appBody': 'Events you created in the Sharecam app appear here when you sign in with the same account you use in the app (Settings → Account).',
  'auth.google': 'Continue with Google', // app: account.continueGoogle
  'auth.apple': 'Continue with Apple', // app: account.continueApple
  'auth.soon': 'Coming',
  'auth.appleSoon': 'Signed in with Apple in the app? Web sign-in with Apple is coming.',
  'auth.orEmail': 'or with email',
  'auth.email': 'Email',
  'auth.password': 'Password',
  'auth.passwordHint': 'At least 6 characters.',
  'auth.signinCta': 'Sign in',
  'auth.createCta': 'Create account',
  'auth.resetCta': 'Send reset link',
  'auth.resetTitle': 'Reset your password',
  'auth.resetSent': 'If {email} has an account, a reset link is on its way. Check your inbox.',
  'auth.toCreate': 'New here? Create an account',
  'auth.toReset': 'Forgot password?',
  'auth.toSignin': 'Back to sign in',
  'auth.haveAccount': 'Already have an account? Sign in',
  'auth.createWithEmail': 'Create an account with this email',
  'auth.errWrong': 'Wrong email or password.',
  'auth.errEmailTaken': 'This email already has an account. Sign in instead.',
  'auth.errWeak': 'Choose a password with at least 6 characters.',
  'auth.errEmail': 'Enter a valid email address.',
  'auth.errPopupBlocked': 'Your browser blocked the sign-in window. Allow pop-ups for this site and try again.',
  'auth.errProviderOff': 'This sign-in is not available on this site yet. Use email instead.',
  'auth.errOffline': 'No connection. Check your internet and try again.',
  'auth.errTooMany': 'Too many attempts. Wait a minute and try again.',
  'auth.errDisabled': 'This account has been disabled. Write to us from the support page.',
  'auth.errRecent': 'For your safety, sign out and sign in again, then repeat this step.',
  'auth.errAlreadyLinked': 'This sign-in is already added to your account.',
  'auth.errGeneric': 'Sign-in failed. Try again.', // app: account.errorGeneric

  // ---------------------------------------------------------------- pair with the app
  'pair.kicker': 'For photographers',
  'pair.title': 'Pair with the Sharecam app',
  'pair.body': 'No web sign-in yet? Connect this computer to the account in your Sharecam app. It works for photographer events.',
  'pair.open': 'Pair with the app',
  'pair.qrTitle': 'Scan this code with the app',
  'pair.step1': 'Open your photographer event in the Sharecam app.',
  'pair.step2': 'Tap “Upload from computer”, then “Scan QR on computer”.',
  'pair.step3': 'Confirm on the phone. This page signs in by itself.',
  'pair.qrAlt': 'Pairing code for the Sharecam app',
  'pair.qrFoot': 'The code renews every few minutes.',
  'pair.qrError': 'The code could not be created. Use the 6-character code below instead.',
  'pair.connecting': 'Connecting…',
  'pair.orCode': 'or type the code from the app',
  'pair.codeLabel': 'Code from the app',
  'pair.codeCta': 'Connect',
  'pair.foot': 'The code signs this computer in as you. Only use it on a computer you trust.', // app: uploadLink.footer (adapted)
  'pair.errNotFound': 'That code isn’t valid. Check it in the app.',
  'pair.errExpired': 'That code has expired. Create a new one in the app.',
  'pair.errUsed': 'That code has already been used. Create a new one in the app.',
  'pair.errGeneric': 'We couldn’t connect this computer. Check your connection and try again.',
  'pair.phoneNote': 'Pairing is for computers. On this phone, sign in instead.',

  // ---------------------------------------------------------------- link a sign-in (paired accounts)
  'link.kicker': 'One more step',
  'link.title': 'Add a sign-in to this account',
  'link.lead': 'Your events stay exactly where they are. Afterwards you can sign in here with it, and the app keeps working as before.',
  'link.buyLead': 'Web purchases need an account you can get back into: receipts go to an email, and the package belongs to this event for its whole storage time. Add a sign-in first; your events stay where they are.',
  'link.google': 'Add Google sign-in',
  'link.apple': 'Add Apple sign-in',
  'link.emailCta': 'Add email sign-in',
  'link.inUseTitle': 'This sign-in already has a Sharecam account',
  'link.inUseBody': 'Sign in to it in the app (Settings → Account); the app moves your events there. Then sign in here with the same account.',
  'link.inUseBack': 'Try another sign-in',

  // ---------------------------------------------------------------- event list
  'list.kicker': 'Host dashboard',
  'list.title': 'Your events',
  'list.lead': 'Everything you host, from the web and from the app.',
  'list.leadEmpty': 'Create an event, share the QR, collect every photo.', // app: welcome.hostDesc
  'list.create': 'Create your event',
  'list.createPro': 'Photographer event',
  'list.groupPro': 'Photographer events',
  'list.groupEvents': 'Events',
  'list.groupAll': 'Events',
  'list.count': '{n} total',
  'list.guestsShort': '{v} guests',
  'list.photosShort': '{v} photos',
  'list.keptUntil': 'Kept until {date}',
  'list.deletion': 'Kept until',
  'list.waiting': 'No package yet — the QR opens once one is active',
  'list.emptyTitle': 'No events yet', // app: dashboard.emptyTitle
  'list.emptyBody': 'Ready in 60 seconds: name, date, privacy — your QR ready to print. Created events in the app? Sign in here with the same account you use there.', // app: dashboard.emptyBody (+ one sentence)
  'list.findHint': 'Can’t find an event you created in the app? Sign in with the same account you use there (Settings → Account). Events of an app that never signed in stay on that phone until you sign in there.',

  // ---------------------------------------------------------------- stats, units, plans
  'stat.guests': 'Guests',
  'stat.photos': 'Photos',
  'stat.videos': 'Videos',
  'unit.days': '{n} days',
  'unit.month': '1 month',
  'unit.months': '{n} months',
  'unit.year': '1 year',
  'unit.years': '{n} years',
  'unit.unlimited': 'Unlimited',
  'unit.unlimitedShort': 'no limit',
  'unit.notIncluded': 'Not included',
  'plan.free': 'Free', // app: paywall.free
  'plan.perEvent': 'per event', // app: paywall.perEvent
  'plan.popular': 'Most popular', // app: plans.wedding.badge
  'plan.storage': 'Storage',
  'plan.refunded': 'Refunded',
  'plan.awaiting': 'Choose a package',
  'plan.webSoon': 'On the web soon',
  'plan.none': 'No package yet',
  'plan.wallIncluded': 'Includes the live wall',
  'plan.awaitingBody': 'Choose a package to open the QR and uploads.',
  'plan.videosFromApp': 'Videos are uploaded from the iPhone app.',

  // ---------------------------------------------------------------- create
  'new.kicker': 'New event',
  'new.kickerPro': 'New photographer event',
  'new.title': 'Create your event',
  'new.titlePro': 'Create a photographer event',
  'new.lead': 'Name it, pick who sees the photos, choose a package. Every event starts free on Spark.',
  'new.leadPro': 'You upload from your computer, originals kept. Guests scan the QR, browse and find their own photos with a selfie.',
  'new.tierLabel': 'Kind of event',
  'new.tierEvents': 'Events',
  'new.tierPro': 'Photographers',
  'new.details': 'Event details', // app: create.step1Title
  'new.name': 'Name your event', // app: create.titleName
  'new.namePlaceholder': 'Amy & Michael’s Wedding', // app: create.namePlaceholder
  'new.nameRequired': 'Please give the event a name.',
  'new.date': 'Event date (optional)', // app: create.dateLabel
  'new.dateHint': 'Storage starts on this day (or today if left empty).',
  'date.pick': 'Pick a date',
  'date.clear': 'Remove date', // app: create.clearDate
  'date.today': 'Today',
  'date.prevMonth': 'Previous month',
  'date.nextMonth': 'Next month',
  'date.help': 'Arrow keys move between days, Page Up and Page Down change the month, Enter picks the day, Escape closes.',
  'new.who': 'Who sees the photos?', // app: create.titleMode
  'new.modeHint': 'You can change this later in Settings.', // app: create.modeHint
  'new.cover': 'Cover photo (optional)',
  'new.coverAdd': 'Add a cover photo',
  'new.coverChange': 'Change',
  'new.locked': 'Name and date can’t be changed later.',
  'new.package': 'Package',
  'new.consumerSoon': 'Paid packages come to the web soon. Start free on Spark now and upgrade later, here or in the app.',
  'new.proSoonTitle': 'Photographer packages come to the web soon',
  'new.proSoonBody': 'Photographer packages come to the web and to the Sharecam iPhone app with its next update. Events you create now keep their name and date.',
  'new.proSoonBodyApp': 'Until then they are sold in the Sharecam iPhone app. Events you create there appear here with the same sign-in.', // once the app sells photographer packages (VITE_PRO_IN_APP=1, go-live G / D26 fallback)
  'new.proRegionLater': 'After you sign in we check that face matching is offered where you are.',
  'new.proNextDecl': 'Next: a short host declaration for face matching.',
  'new.ctaFree': 'Create event',
  'new.ctaPaid': 'Create and pay · {plan} {price}',
  'new.created': 'Event created.',
  'new.createFailed': 'The event could not be created. Check your connection and try again.',
  'new.backToForm': 'Back to the form',
  'new.stepAccount': 'Almost there',
  'new.accountTitle': 'Save your event to an account',
  'new.accountLead': 'Your event needs an account you can come back to. Use the same sign-in as in the app if you have one.',
  'new.summary': 'Your event',
  'mode.openTitle': 'Open gallery', // app: create.openTitle
  'mode.openDesc': 'Everyone sees and likes what gets uploaded. A live shared album.', // app: create.openDesc
  'mode.privateTitle': 'Private mode', // app: create.privateTitle
  'mode.privateDesc': 'Only you see everything; guests see just their own uploads. Perfect for a surprise album.', // app: create.privateDesc

  // ---------------------------------------------------------------- event page
  'event.kicker': 'Event',
  'event.kickerPro': 'Photographer event', // app: hostEvent.hostOnlyTitle
  'event.noDate': 'No date set', // app: hostEvent.noDate
  'event.codeLine': 'Code {code}',
  'event.goneTitle': 'This event is no longer available', // app: eventGone.title
  'event.goneBody': 'It may have been deleted, or its storage period has ended.', // app: eventGone.body
  'event.notYoursTitle': 'This event belongs to another account',
  'event.notYoursBody': 'Sign in with the account that created it — the same one you use in the app.',
  'tab.label': 'Event sections',
  'tab.overview': 'Overview',
  'tab.gallery': 'Gallery',
  'tab.guests': 'Guests', // app: hostEvent.tabGuests
  'tab.settings': 'Settings', // app: hostEvent.tabSettings
  'tab.plan': 'Package', // app: hostEvent.planTitle
  'tab.downloads': 'Downloads',

  // overview
  'overview.createdTitle': 'Event created!', // app: qr.createdTitle
  'overview.createdBody': 'Share the QR code with your guests — every shot lands in your gallery.', // app: qr.createdSubtitle
  'overview.createdBodyPro': 'Upload your photos from this computer. Guests scan the QR to browse and find themselves.',
  'overview.stats': 'So far',
  'overview.statsPro': 'In the album',
  'overview.package': 'Package', // app: hostEvent.planTitle
  'overview.keptUntil': 'Kept until',
  'overview.face': 'Face matching', // app: hostEvent.aiTitle
  'overview.faceNot': 'Not in this package',
  'overview.wall': 'Live wall', // app: hostEvent.wallTitle
  'overview.included': 'Included',
  'overview.changePackage': 'Change package',
  'overview.refundedNote': 'The payment for this event was refunded. The album stays until its storage ends; buying a package again reactivates it.',
  'overview.privateLine': 'Private — guests see only their own photos. Open the gallery in Settings.',
  'qr.kicker': 'Invite',
  'qr.title': 'Guests join in one step', // app: qr.title
  'qr.body': 'Put the QR on the tables or send the link. Guests type their name and share from their phone’s browser — no app, no account.',
  'qr.titlePro': 'The guests’ QR',
  'qr.bodyPro': 'Guests scan it to browse the album, save photos and find themselves with a selfie. Only you upload.',
  'qr.codeLabel': 'Event code', // app: qr.codeLabel
  'qr.linkLabel': 'Guest link',
  'qr.alt': 'QR code for event {code}',
  'qr.png': 'Download QR (PNG)',
  'qr.share': 'Share invite', // app: qr.share (web: sentence case)
  'qr.shareText': 'Join the photo album for {name} (code {code})',
  'qr.faceLine': 'Face matching is on: the printed QR carries the one-line notice for guests.',
  'upload.kicker': 'Upload',
  'upload.title': 'Upload from your computer', // app: uploadLink.title
  'upload.body': 'Drag a whole folder in from your computer. Originals are kept at full resolution; guests see light previews.', // app: uploadLink.subtitle
  'upload.cta': 'Upload originals',
  'upload.countOf': 'of {cap} photos',
  'upload.countUnlimited': 'photos, no limit',
  'owner.title': 'Share with the couple', // app: hostEvent.shareOwnerTitle
  'owner.body': 'Give the couple a one-time code. On sharecam.app/album they see the whole album and download everything — full resolution, in parts.', // app: hostEvent.shareOwnerBody
  'owner.cta': 'Create a code for the couple', // app: hostEvent.shareOwnerCta
  'owner.newCode': 'New code', // app: ownerLink.newCode
  'owner.expires': 'Expires in {time} · single use', // app: ownerLink.expiresIn
  'owner.expired': 'This code has expired', // app: ownerLink.expired
  'owner.link': 'Album link',
  'owner.foot': 'Only the couple should get this code — it unlocks the full album for download.', // app: ownerLink.footer
  'owner.error': 'We couldn’t create a code. Check your connection and try again.', // app: ownerLink.error
  'wall.title': 'Live wall', // app: hostEvent.wallTitle
  'wall.openBody': 'The wall is live. Open this link on the venue TV, laptop or projector — no cable, no app.',
  'wall.privateWarning': 'Private mode hides uploads until you reveal them, so the wall stays off. Switch to open to use it.', // app: wall.privateWarning
  'await.kicker': 'Photographer event',
  'await.title': 'Choose a package to get your QR',
  'await.body': 'This event has no photographer package yet. Its QR, code and upload page open as soon as a package is active. Name and date are saved.',
  'await.cta': 'Choose a package',

  // expiry (D19)
  'expiry.title': 'Photos of “{name}” are deleted in {n} days',
  'expiry.titleOne': 'Photos of “{name}” are deleted tomorrow',
  'expiry.todayTitle': 'Photos of “{name}” are deleted today',
  'expiry.body': 'Storage ends on {date}. Download the album before then — after that it can’t be brought back.',
  'expiry.refundedBody': 'Storage ends on {date}. Downloads are off because the payment was refunded. Buying a package again turns them back on.',
  'expiry.download': 'Download',
  'expiry.listTitle': 'Storage ends soon',
  'expiry.listBody': 'After this date the photos are deleted and can’t be brought back. Download what you want to keep.',
  'expiry.listBodyRefunded': 'After this date the photos are deleted and can’t be brought back. Downloads are off for refunded events; buying a package again turns them back on.',
  'expiry.keepLonger': 'Keep it longer: change package',
  'expiry.whenDays': 'in {n} days',
  'expiry.whenTomorrow': 'tomorrow',
  'expiry.whenToday': 'today',
  'expiry.icsShort': 'Reminder',
  'expiry.ics': 'Add a calendar reminder',
  'expiry.icsTitle': 'Download your Sharecam photos: {name}',
  'expiry.icsBody': 'The photos of “{name}” are deleted on {date}. Open the host dashboard to download them.',

  // gallery
  'gallery.count': '{n} items · {shown} loaded',
  'gallery.filter': 'Show',
  'gallery.all': 'All', // app: gallery.all
  'gallery.reportedN': 'Reported ({n})', // app: hostEvent.reportedFilter
  'gallery.hiddenN': 'Hidden ({n})',
  'gallery.hidden': 'Hidden',
  'gallery.reported': 'Reported',
  'gallery.hide': 'Hide from guests',
  'gallery.show': 'Show to guests',
  'gallery.hiddenToast': 'Hidden from guests.',
  'gallery.shownToast': 'Visible to guests again.',
  'gallery.deleteTitle': 'Delete this photo?', // app: hostEvent.deleteTitle
  'gallery.deleteBody': 'It will be removed from the gallery.', // app: hostEvent.deleteBody
  'gallery.deletedToast': 'Deleted.',
  'gallery.more': 'Load more',
  'gallery.emptyTitle': 'No photos yet', // app: hostEvent.emptyTitle
  'gallery.emptyBody': 'Put the QR on the tables — the first shot will show up here.',
  'gallery.emptyPro': 'Upload from your computer — originals are kept, guests see the gallery within minutes.', // app: hostEvent.emptyProBody
  'gallery.noneReported': 'Nothing reported among the loaded items.',
  'gallery.noneHidden': 'Nothing hidden among the loaded items.',
  'gallery.viewer': 'Photo viewer',
  'gallery.openItem': 'Open photo by {name}',
  'gallery.photoAlt': 'Photo by {name}',
  'gallery.unknownOwner': 'Guest',
  'gallery.openFull': 'Open full size',

  // guests
  'guests.emptyTitle': 'No guests yet', // app: guests.emptyTitle
  'guests.emptyBody': 'Everyone who joins with the QR or code appears here, with their name.', // app: guests.emptyBody
  'guests.ban': 'Remove', // app: guests.ban
  'guests.unban': 'Restore', // app: guests.unban
  'guests.bannedTag': 'removed', // app: guests.bannedTag
  'guests.banTitle': 'Remove {name}?', // app: guests.banTitle
  'guests.banBody': 'They won’t be able to rejoin or upload. Their photos stay (you can delete them from the gallery).', // app: guests.banBody
  'guests.owner': 'Album owner',
  'guests.noName': 'Guest',
  'guests.joined': 'joined {time}',
  'guests.removedToast': '{name} was removed.',
  'guests.restoredToast': '{name} can join again.',
  'guests.capTitle': 'Guests in this event',
  'guests.capBody': 'Removed guests don’t count; their place is free again.',
  'guests.full': 'Guest limit reached ({limit}). Upgrade to let more people join.', // app: guests.limitFull (adapted)

  // settings
  'settings.galleryTitle': 'Who joins, who sees',
  'settings.privateTitle': 'Private mode', // app: hostEvent.privateTitle
  'settings.privateOn': 'Guests only see their own photos.', // app: hostEvent.privateOn
  'settings.privateOff': 'Everyone sees the whole gallery.', // app: hostEvent.privateOff
  'settings.statePrivate': 'Private', // app: hostEvent.statePrivate
  'settings.statePublic': 'Public', // app: hostEvent.statePublic
  'settings.revealTitle': 'Open the gallery to everyone?', // app: hostEvent.revealTitle
  'settings.revealBody': 'Guests will now see each other’s photos. This is a “reveal” — are you sure?', // app: hostEvent.revealBody
  'settings.revealConfirm': 'Yes, open it', // app: hostEvent.revealConfirm
  'settings.autoRevealTitle': 'Auto-reveal', // app: hostEvent.revealSchedTitle
  'settings.autoRevealOn': 'Gallery opens to everyone {time}.', // app: hostEvent.revealSchedOn
  'settings.autoRevealOff': 'Off: stays private until you open it yourself.', // app: hostEvent.revealSchedOff
  'settings.revealPick': 'Pick the date and time', // app: hostEvent.revealPick
  'settings.pauseTitle': 'Pause new joins', // app: hostEvent.pauseTitle
  'settings.pauseOn': 'Nobody new can join. Guests already in stay.', // app: hostEvent.pauseOn
  'settings.pauseOff': 'Anyone with the QR or code can join.', // app: hostEvent.pauseOff
  'settings.statePaused': 'Paused', // app: hostEvent.statePaused
  'settings.stateOpen': 'Open', // app: hostEvent.stateOpen
  'settings.downloadTitle': 'Guest downloads', // app: hostEvent.downloadTitle
  'settings.downloadDesc': 'Guests can save photos.', // app: hostEvent.downloadDesc
  'settings.hostOnlyTitle': 'Photographer event', // app: hostEvent.hostOnlyTitle
  'settings.hostOnlyBody': 'Only you upload. Guests view the gallery, save photos and find themselves with a selfie. This cannot be changed.', // app: hostEvent.hostOnlyBody
  'settings.detailsTitle': 'Event details', // app: hostEvent.detailsTitle
  'settings.name': 'Name',
  'settings.date': 'Date',
  'settings.code': 'Code',
  'settings.noCover': 'No cover photo',
  'settings.coverAdd': 'Add a cover photo',
  'settings.coverChange': 'Change cover',
  'settings.coverSaved': 'Cover saved.',
  'settings.coverRemoved': 'Cover removed.',
  'settings.lockedNote': 'Name and date are locked.',
  'settings.saved': 'Saved.',
  'settings.dangerTitle': 'Danger zone', // app: hostEvent.dangerTitle
  'settings.dangerBody': 'Deleting removes the event, its photos and its guest list for everyone — your guests included. This cannot be undone.', // app: hostEvent.dangerBody
  'settings.deleteCta': 'Delete event',
  'settings.deleteTitle': 'Delete this event?', // app: hostEvent.deleteEventTitle
  'settings.deleteBody': '“{name}” and every photo in it will be permanently removed.', // app: hostEvent.deleteEventBody
  'settings.deleteConfirm': 'Delete…', // app: hostEvent.deleteEventConfirm
  'settings.deleteTitle2': 'Are you absolutely sure?', // app: hostEvent.deleteEventTitle2
  'settings.deleteBody2': 'This is permanent — there is no way to bring the event back.', // app: hostEvent.deleteEventBody2
  'settings.deleted': 'Event deleted.',
  'settings.deletePairedNote': 'To delete this event, sign in on this computer with the account’s own sign-in (not by pairing with the app), or delete it in the app.',

  // face matching (the app's versioned texts, face.* 2026-09-23 — copy verbatim)
  'face.title': 'Face matching', // app: hostEvent.aiTitle
  'face.tabTitle': 'Find your photos', // app: face.tabTitle
  'face.aiOn': 'On: guests can find their own photos by face.', // app: hostEvent.aiOn
  'face.aiOff': 'Off: guests don’t see “Find your photos”.', // app: hostEvent.aiOff
  'face.notInPackage': 'Face matching is not part of this package. It can be added in the Sharecam app.',
  'face.hostConfirmTitle': 'Turn on face matching?', // app: face.hostConfirmTitle
  'face.hostConfirmBody': 'Your guests can then find their own photos with a selfie. You are responsible for telling them it is in use — we give you wording for the invitation and a sign. It must not be used to track attendance or identify anyone who has not asked to be identified.', // app: face.hostConfirmBody
  'face.hostConfirmCta': 'Turn it on', // app: face.hostConfirmCta
  'face.remindTitle': 'Tell your guests now', // app: face.noticeTitle (adapted)
  'face.remindBody': 'Copy the wording below into your invitation or group chat, and print the QR with its notice line.',
  'face.noticeTitle': 'Tell your guests', // app: face.noticeTitle
  'face.noticeSub': 'Paste this into your invitation, your group chat, or a card on the tables.', // app: face.noticeSub
  'face.noticeText': 'Photos at this event are collected in a shared album. It offers optional face matching so you can find your own photos. It\'s your choice, and you can decline. Details: sharecam.app/face-grouping', // app: face.noticeText
  'face.noticeCopy': 'Copy the wording', // app: face.noticeCopy
  'face.noticeCopied': 'Copied', // app: face.noticeCopied
  'face.noticePrint': 'The QR you download from Overview carries the one-line notice for printed cards.',
  'face.cardNotice': 'Optional face matching in this album · sharecam.app/face-grouping', // app: face.cardNotice
  'face.regionTitle': 'Not available in your region', // app: face.regionTitle
  'face.regionBody': 'Face matching isn’t offered where you are yet. We only open it where we can meet the local rules on face data, so we never sell you something your guests cannot use.', // app: face.regionBody
  'face.regionSoonTitle': 'Coming soon where you are', // app: face.regionSoonTitle
  'face.regionSoonBody': 'We are completing the registration that lets us process face data for your country. Everything else in the album works as usual.', // app: face.regionSoonBody
  'face.regionUnknownTitle': 'We couldn’t confirm where you are', // app: face.regionUnknownTitle
  'face.regionUnknownBody': 'This feature depends on local rules about face data, so we only turn it on when we can tell which rules apply. Everything else in the album works as usual.', // app: face.regionUnknownBody
  'face.declTitle': 'Before you add it', // app: face.declTitle
  'face.declTitleWeb': 'Face matching: your host declaration', // web only: the declaration step title (the versioned face.decl1–5 text stays verbatim)
  'face.declIntro': 'You are the organiser of this event, so these are your calls to make. By ticking the box you confirm:', // app: face.declIntro
  'face.decl1': 'I decide who is invited and photographed at this event.', // app: face.decl1
  'face.decl2': 'I will tell my guests that face matching is on — using the invitation wording and the printed card in this app.', // app: face.decl2
  'face.decl3': 'My event is not in Illinois, Texas or Washington.', // app: face.decl3
  'face.decl4': 'Face data is processed by AWS in Frankfurt, Germany, and deleted when I switch this off or the album is deleted.', // app: face.decl4
  'face.decl5': 'I am responsible for following the rules that apply where my event takes place.', // app: face.decl5
  'face.declAccept': 'I have read and accept the host terms', // app: face.declAccept
  'face.declRead': 'Read the full host terms', // app: face.declRead
  'face.declError': 'We couldn’t record your acceptance. Check your connection and try again.', // app: face.declError
  'decl.kicker': '{plan} · face matching included',
  'decl.continue': 'Accept and continue to payment',

  // ---------------------------------------------------------------- package & checkout (§3.4)
  'checkout.kicker': 'Packages',
  'checkout.kickerPro': 'Photographer packages', // app: paywall.titlePro
  'checkout.titleNew': 'Pick a package for your event', // app: paywall.title
  'checkout.titleUpgrade': 'Upgrade your package', // app: paywall.titleUpgrade
  'checkout.titleInfo': 'What each package includes',
  'checkout.subtitle': 'One-time payment — not a subscription. Pick the size that fits your guest list.', // app: paywall.subtitle
  'checkout.subtitlePro': 'One-time payment per event. You upload from your computer; guests scan the QR, browse and find their own photos with a selfie.', // app: paywall.subtitlePro
  'checkout.current': 'Now',
  'checkout.upgradeRule': 'Upgrading costs the full price of the bigger package.',
  'checkout.choose': 'Choose a package',
  'checkout.cta': 'Pay {price} · {plan}',
  'checkout.opening': 'Opening the secure checkout…',
  'checkout.paying': 'Finish the payment in the checkout window.',
  'checkout.sandbox': 'Sandbox · test payments',
  'checkout.footnote': 'Prices in USD (the same list price as the App Store in the US). In the app, Apple charges in your local currency; on the web, Paddle may show your local currency and tax at checkout. Payments are processed by Paddle, our merchant of record.',
  'checkout.soonTitle': 'Buying on the web is coming soon',
  'checkout.soonOff': 'Packages can’t be bought on the web yet.',
  'checkout.soonPrices': 'These packages aren’t sold on the web yet.',
  'checkout.soonApp': 'Until then, packages are sold in the Sharecam iPhone app — this event appears there with the same sign-in.',
  'checkout.soonAppPro': 'Photographer packages come to the web and to the Sharecam iPhone app with its next update. This event keeps its name and date.',
  'checkout.soonAppProLive': 'Until then, photographer packages are sold in the Sharecam iPhone app — this event appears there with the same sign-in.', // once the app sells photographer packages (VITE_PRO_IN_APP=1)
  'checkout.maxedTitle': '{plan} is the biggest package',
  'checkout.maxedBody': 'There is nothing to upgrade on this event.',
  'checkout.unavailableTitle': 'This event can’t be upgraded here',
  'checkout.unavailableBody': 'It belongs to another account, or it no longer exists.',
  'checkout.codeNotPro': 'Photographer packages need an event created as a photographer event. Create a new photographer event instead.',
  'checkout.refundedTitle': 'This event was refunded',
  'checkout.refundedBody': 'Buying a package again reactivates it: uploads, face matching (where included) and downloads come back.',
  'checkout.abandonedTitle': 'Your event is on Spark (free)',
  'checkout.abandoned': 'Nothing was charged. Choose a package any time — your QR already works on Spark.',
  'checkout.closedNote': 'The checkout was closed. Nothing was charged.',
  'checkout.applyingTitle': 'Payment received',
  'checkout.applyingBody': 'We are activating {plan} on this event. This page updates by itself.',
  'checkout.slowTitle': 'Payment received — almost there',
  'checkout.slowBody': 'Your payment is in. {plan} will be applied within minutes; you can leave this page. If it isn’t active within an hour, write to us.',
  'checkout.doneTitle': 'Done 🎉', // app: paywall.doneTitle
  'checkout.doneBody': '{plan} package is active. Paddle sends the receipt to your email.', // app: paywall.active (+ receipt)
  'checkout.toOverview': 'Go to event', // app: qr.goToEvent (web: sentence case)
  'checkout.coveredTitle': 'This event already has {plan}',
  'checkout.coveredBody': 'If you paid twice, we refund the extra payment. Questions: {email}',
  'checkout.failedTitle': 'Your payment could not be applied',
  'checkout.failedBody': 'We refund it — you don’t need to do anything. Questions: {email}',
  'checkout.openFailedTitle': 'The checkout could not be opened',
  'checkout.openFailedBody': 'Nothing was charged. Please try again in a moment.',
  'checkout.tooMany': 'Too many checkouts were opened today. Please try again tomorrow or write to us.',
  'checkout.backToPackages': 'Back to packages',
  'checkout.contact': 'Contact support',
  'checkout.mailSlow': 'Web payment not applied yet',
  'checkout.mailDuplicate': 'Paid twice',
  'checkout.mailFailed': 'Web payment not applied',
  'checkout.proIncludesTitle': 'Every photographer package:',
  'checkout.proInc1': 'Face matching included, where available', // app: paywall.featAiIncluded (adapted)
  'checkout.proInc2': 'Only you upload — guests view', // app: paywall.featHostOnly
  'checkout.proInc3': 'Originals kept, full resolution', // app: paywall.featOriginals

  // ---------------------------------------------------------------- downloads
  'downloads.zipTitle': 'Download the album',
  'downloads.zipBody': 'Every photo and video in one ZIP file. Large albums take a minute to prepare.',
  'downloads.zipCta': 'Download ZIP', // app: download.zip
  'downloads.zipWorking': 'Zipping…', // app: download.zipWorking
  'downloads.zipReady': 'Download ZIP ({n} items)',
  'downloads.displayTitle': 'For sharing — 2048 px',
  'downloads.displayBody': 'The whole album in ZIP parts of 500 photos, sized for screens and social.',
  'downloads.originalTitle': 'Originals — full resolution',
  'downloads.originalBody': 'Your uploads exactly as they were, in ZIP parts of 150 photos.',
  'downloads.prepare': 'Prepare download',
  'downloads.again': 'Prepare again',
  'downloads.preparing': 'Preparing part {done} of {total}…',
  'downloads.part': 'Part {n} of {of}',
  'downloads.items': '{n} photos',
  'downloads.download': 'Download',
  'downloads.validity': 'Full album as ZIP parts — 2048px for sharing, originals at full resolution for keeping. Links stay valid for 7 days and can be regenerated.', // app: ownerLink.step3Body
  'downloads.refundedTitle': 'Downloads are off for refunded events',
  'downloads.refunded': 'The payment for this event was refunded, so the album can’t be exported as a ZIP. Buying a package again re-enables it.', // app: download.zipRefunded
  'downloads.buyAgain': 'See packages',
  'downloads.nothing': 'There is nothing to download yet.',
  'downloads.failed': 'Couldn’t build the ZIP.', // app: download.zipFailed
  'downloads.keepTitle': 'Keep a copy',
  'downloads.keepBody': 'Storage ends on {date}. Download the album before then.',
  'downloads.keepBodyNoDate': 'Download the album before its storage ends.',

  // ---------------------------------------------------------------- account
  'account.kicker': 'Account', // app: account.title
  'account.title': 'Your account',
  'account.signins': 'Sign-ins',
  'account.pairedOnly': 'This computer is paired with the Sharecam app. The account has no sign-in of its own yet.',
  'account.sameAsApp': 'Your events belong to this account — the same one you use in the Sharecam app.',
  'account.addAnother': 'Add another sign-in',
  'account.addAnotherBody': 'A second way in, for the day you lose access to the first one.',
  'account.linked': 'Sign-in added.',
  'account.signOutTitle': 'Sign out', // app: account.signOut
  'account.signOutBody': 'Your events stay in your account. Sign in again any time.',
  'account.signOutPaired': 'Without a sign-in of its own, this computer can only come back by pairing with the app again.',
  'account.deleteCta': 'Delete account & data', // app: account.deleteCta
  'account.deleteTitle': 'Delete your account and data?', // app: account.deleteTitle
  'account.deleteBody': 'Your account, every event you created, all photos and guest lists are permanently deleted — on every device. This cannot be undone.', // app: account.deleteBody
  'account.deleteConfirm': 'Delete everything', // app: account.deleteConfirm
  'account.deleted': 'Your account and data have been deleted.', // app: account.deleted
  'account.deleteFailed': 'Your account could not be deleted. Please try again.', // app: account.deleteFailed
  'account.deletePairedNote': 'To delete the account, sign in on this computer with its own sign-in (not by pairing with the app), or delete it in the app (Settings → Account).',
} satisfies Record<string, string>;

export type Key = keyof typeof en;
export type Dict = Record<Key, string>;
