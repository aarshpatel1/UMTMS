import { FOREIGN_KEY_MAP, ENTITIES_CONFIG } from '../../config/routesConfig'
import { formatCellDisplay } from '../../utils/formatters'

export default function RelatedRecordModal({
  modalStack = [],
  onCloseTop,
  onCloseAll,
  onOpenRelated,
}) {
  if (modalStack.length === 0) return null

  // Render all active modals in the stack with progressive z-index and scaling
  return (
    <>
      {modalStack.map((modalItem, index) => {
        const isTop = index === modalStack.length - 1
        const depth = index + 1
        const { entityKey, id, record, loading, error } = modalItem
        const config = ENTITIES_CONFIG[entityKey] || {}
        const zIndexBase = 1060 + index * 15

        return (
					<div
						key={`${entityKey}-${id}-${index}`}
						className="custom-modal-backdrop"
						style={{
							zIndex: zIndexBase,
							backgroundColor:
								index === 0
									? "rgba(16, 24, 40, 0.45)"
									: "rgba(16, 24, 40, 0.25)",
						}}
						onClick={() => isTop && onCloseTop()}
						role="dialog"
						aria-modal="true"
					>
						<div
							className="custom-modal-dialog"
							style={{
								maxWidth: "620px",
								transform: isTop
									? "scale(1) translateY(0)"
									: `scale(${1 - (modalStack.length - 1 - index) * 0.03}) translateY(${(modalStack.length - 1 - index) * -8}px)`,
								boxShadow: isTop ? "var(--shadow-toast)" : "var(--shadow-md)",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							{/* Modal Header */}
							<div className="custom-modal-header">
								<div className='d-flex align-items-center'>
									<h5 className="custom-modal-title me-4 mb-2">
										{config.singularTitle || "Record"} #{id}
									</h5>
										<div className="d-flex align-items-center gap-2 mb-1">
											<span className="badge bg-light text-dark border">
												<i className="bi bi-diagram-3 me-1"></i>
												Related Record
											</span>
											{depth > 1 && (
												<span
													className="badge rounded-pill bg-purple-subtle text-purple border border-purple-subtle"
													style={{
														color: "#7f56d9",
														backgroundColor: "#f9f5ff",
													}}
												>
													Overlay Modal
												</span>
											)}
										</div>
								</div>

								<div className="d-flex align-items-center gap-2">
									{/* {modalStack.length > 1 && isTop && (
										<button
											type="button"
											className="btn btn-sm btn-outline-secondary"
											onClick={onCloseTop}
											title="Return to previous modal"
										>
											<i className="bi bi-arrow-left me-1"></i>
											Back
										</button>
									)} */}
									<button
										type="button"
										className="custom-modal-close"
										onClick={onCloseTop}
										aria-label="Close modal"
									>
										<i className="bi bi-x-lg"></i>
									</button>
								</div>
							</div>

							{/* Breadcrumb path if nested */}
							{modalStack.length > 1 && (
								<div className="px-4 pt-2 pb-0">
									<div className="d-flex align-items-center gap-1 small text-muted">
										<span>Navigation Trail:</span>
										{modalStack.map((m, mIdx) => {
											const mConf = ENTITIES_CONFIG[m.entityKey] || {};
											return (
												<span
													key={mIdx}
													className="d-inline-flex align-items-center gap-1"
												>
													{mIdx > 0 && (
														<span className="text-secondary">›</span>
													)}
													<span
														className={
															mIdx === index
																? "fw-bold text-dark"
																: "text-muted"
														}
													>
														{mConf.singularTitle || m.entityKey} #{m.id}
													</span>
												</span>
											);
										})}
									</div>
								</div>
							)}

							{/* Modal Body */}
							<div className="custom-modal-body">
								{loading ? (
									<div className="text-center py-4">
										<div
											className="spinner-border spinner-border-sm text-dark mb-2"
											role="status"
										>
											<span className="visually-hidden">Loading...</span>
										</div>
										<p className="small text-muted mb-0">
											Fetching related record details...
										</p>
									</div>
								) : error ? (
									<div className="alert alert-danger py-2 small mb-0">
										Failed to fetch record: {error}
									</div>
								) : record ? (
									<div>
										<div className="row g-2">
											{Object.entries(record).map(([key, val]) => {
												const colConfig = config.columns?.find(
													(c) => c.key === key,
												);
												const label =
													colConfig?.label ||
													key.replace(/_/g, " ").toUpperCase();
												const isPrimaryId = key === config.primaryKey;
												const fkInfo = !isPrimaryId && FOREIGN_KEY_MAP[key];
												const isOtherId =
													!isPrimaryId &&
													(Boolean(fkInfo) ||
														(key.endsWith("_id") &&
															val !== null &&
															val !== undefined));

												return (
													<div key={key} className="col-12 col-sm-6">
														<div className="p-2 border rounded bg-light h-100">
															<div
																className="text-muted small fw-semibold mb-1"
																style={{ fontSize: "0.75rem" }}
															>
																{label}
															</div>

															<div className="d-flex align-items-center justify-content-between gap-2">
																<div
																	className="fw-semibold text-dark text-truncate"
																	style={{ fontSize: "0.88rem" }}
																>
																	{formatCellDisplay(key, val)}
																</div>

																{/* Eye Button to Open Nested Overlay Modal if this is another ID */}
																{isOtherId &&
																	val !== null &&
																	val !== undefined &&
																	val !== "" && (
																		<button
																			type="button"
																			className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-0 px-2"
																			style={{
																				fontSize: "0.75rem",
																				height: "24px",
																			}}
																			title={`Open overlay modal for ${fkInfo?.label || "Related Record"} #${val}`}
																			onClick={() => {
																				const targetEntity =
																					fkInfo?.entityKey ||
																					key.replace("_id", "s");
																				onOpenRelated(targetEntity, val, label);
																			}}
																		>
																			<i className="bi bi-eye"></i>
																			<span>View</span>
																		</button>
																	)}
															</div>
														</div>
													</div>
												);
											})}
										</div>
									</div>
								) : (
									<div className="text-muted text-center py-3">
										No record found.
									</div>
								)}
							</div>

							{/* Modal Footer */}
							<div className="custom-modal-footer">
								{modalStack.length > 1 && (
									<button
										type="button"
										className="btn btn-outline-secondary btn-sm"
										onClick={onCloseAll}
									>
										Close All ({modalStack.length})
									</button>
								)}
								<button
									type="button"
									className="btn btn-dark btn-sm px-3"
									onClick={onCloseTop}
								>
									{modalStack.length > 1 ? "Close This Modal" : "Close"}
								</button>
							</div>
						</div>
					</div>
				);
      })}
    </>
  )
}
