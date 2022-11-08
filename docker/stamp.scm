(define (utt.save.start_times utt filename)
"(utt.save.start_times UTT FILE)
  Save tokens with start time stamps."
  (let ((fd (fopen filename "w")))
    (mapcar
     (lambda (tok_item)
	   (format fd "%2.4f %s\n"
		   (find_start_time utt tok_item)
		   (item.name tok_item)))
     (utt.relation.items utt 'Token))
    (fclose fd)
    utt))

(define (find_start_time utt tok_item)
"Returns start time of tok_item."
  (cond
   ((item.daughtern tok_item)
    (item.feat (item.daughtern tok_item) "word_start"))
   ((not (item.prev tok_item))  ;; start of stream
    0.0)
   (t
    (find_start_time utt (item.prev tok_item)))))
